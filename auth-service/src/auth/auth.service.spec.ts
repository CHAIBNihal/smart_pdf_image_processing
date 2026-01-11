import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client.js';

// ⚠️ IMPORTANT : Mock argon2 car c'est un module externe
jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  //  MOCK de PrismaService
  // Vous devez mocker les DÉPENDANCES de AuthService, pas AuthService lui-même
  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  //  MOCK de JwtService
  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService, //  Le service réel que vous testez
        {
          //  Remplacer PrismaService par le mock
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          //  Remplacer JwtService par le mock
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    //  Réinitialiser tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  
  describe('SignUp', () => {
    const mockDto = {
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
    };

    it('should create a new user successfully', async () => {
      // 1️⃣ ARRANGE (Préparer)
      const hashedPassword = 'hashed_password_123';
      const createdUser = {
        id: 'user-123',
        fullName: mockDto.fullName,
        email: mockDto.email,
        Role: 'USER',
        isTokenExpired: false,
      };

      // Configurer les mocks
      (argon.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      // 2️⃣ ACT (Agir)
      const result = await service.SignUp(mockDto);

      // 3️⃣ ASSERT (Vérifier)
      // Vérifier que argon.hash a été appelé avec le bon mot de passe
      expect(argon.hash).toHaveBeenCalledWith(mockDto.password);
      expect(argon.hash).toHaveBeenCalledTimes(1);

      // Vérifier que Prisma a été appelé avec les bonnes données
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          fullName: mockDto.fullName,
          email: mockDto.email,
          password: hashedPassword,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          Role: true,
          isTokenExpired: true,
        },
      });

      // Vérifier le résultat retourné
      expect(result).toEqual(createdUser);
      expect(result).not.toHaveProperty('password'); // Le password ne doit pas être retourné
    });

    it('should throw ForbiddenException when email already exists', async () => {
      // 1️⃣ ARRANGE
      (argon.hash as jest.Mock).mockResolvedValue('hashed');

      // Créer une erreur Prisma P2002 (contrainte unique)
      const prismaError = new PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        }
      );

      mockPrismaService.user.create.mockRejectedValue(prismaError);

      // 2️⃣ ACT & 3️⃣ ASSERT
      await expect(service.SignUp(mockDto)).rejects.toThrow(ForbiddenException);
      await expect(service.SignUp(mockDto)).rejects.toThrow('Credentials taken');
    });

    it('should rethrow unexpected errors', async () => {
      // 1️⃣ ARRANGE
      (argon.hash as jest.Mock).mockResolvedValue('hashed');
      const unexpectedError = new Error('Database connection failed');
      mockPrismaService.user.create.mockRejectedValue(unexpectedError);

      // 2️⃣ ACT & 3️⃣ ASSERT
      await expect(service.SignUp(mockDto)).rejects.toThrow(unexpectedError);
    });
  });

 
  describe('SignIn', () => {
    const mockSignInDto = {
      email: 'john@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user-123',
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      Role: 'USER',
      isTokenExpired: false,
    };

    it('should sign in user successfully with correct credentials', async () => {
      // 1️⃣ ARRANGE
      const mockToken = 'jwt_token_123';

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      // 2️⃣ ACT
      const result = await service.SignIn(mockSignInDto);

      // 3️⃣ ASSERT
      // Vérifier que l'utilisateur a été recherché
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: mockSignInDto.email },
      });

      // Vérifier que le mot de passe a été vérifié
      expect(argon.verify).toHaveBeenCalledWith(
        mockUser.password,
        mockSignInDto.password
      );

      // Vérifier que le token a été généré
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          email: mockUser.email,
          username: mockUser.fullName,
          role: mockUser.Role,
        },
        { expiresIn: "1d" }
      );

      // Vérifier la structure de la réponse
      expect(result).toEqual({
        access_token: mockToken,
        data: {
          email: mockUser.email,
          username: mockUser.fullName,
          role: mockUser.Role,
        },
      });
    });

    it('should throw ForbiddenException when user does not exist', async () => {
      // 1️⃣ ARRANGE
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      // 2️⃣ ACT & 3️⃣ ASSERT
      await expect(service.SignIn(mockSignInDto)).rejects.toThrow(
        ForbiddenException
      );
      await expect(service.SignIn(mockSignInDto)).rejects.toThrow(
        'this account is Undefined, please create an account'
      );

      // Vérifier que argon.verify n'a PAS été appelé
      expect(argon.verify).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      // 1️⃣ ARRANGE
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      (argon.verify as jest.Mock).mockResolvedValue(false); // Mot de passe incorrect

      // 2️⃣ ACT & 3️⃣ ASSERT
      await expect(service.SignIn(mockSignInDto)).rejects.toThrow(
        UnauthorizedException
      );

      // Vérifier que le token n'a PAS été généré
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user has no password (Google account)', async () => {
      // 1️⃣ ARRANGE
      const googleUser = {
        ...mockUser,
        password: null, // Compte Google sans mot de passe
      };

      mockPrismaService.user.findFirst.mockResolvedValue(googleUser);

      // 2️⃣ ACT & 3️⃣ ASSERT
      await expect(service.SignIn(mockSignInDto)).rejects.toThrow(
        UnauthorizedException
      );

      // argon.verify ne doit pas être appelé car password est null
      expect(argon.verify).not.toHaveBeenCalled();
    });

    it('should sign in without password verification when password is not provided (Google flow)', async () => {
      // 1️⃣ ARRANGE
      const dtoWithoutPassword = {
        email: 'john@example.com',
        // Pas de password
      };

      const mockToken = 'jwt_token_123';

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      // 2️⃣ ACT
      const result = await service.SignIn(dtoWithoutPassword);

      // 3️⃣ ASSERT
      // argon.verify ne doit PAS être appelé
      expect(argon.verify).not.toHaveBeenCalled();

      // Mais le token doit être généré
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
    });
  });


  describe('signToken', () => {
    it('should generate a JWT token with correct payload', async () => {
      // 1️⃣ ARRANGE
      const userId = 'user-123';
      const email = 'john@example.com';
      const username = 'John Doe';
      const role = 'USER';
      const mockToken = 'jwt_token_123';

      mockJwtService.signAsync.mockResolvedValue(mockToken);

      // 2️⃣ ACT
      const result = await service.signToken(userId, email, username, role);

      // 3️⃣ ASSERT
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        {
          sub: userId,
          email: email,
          username: username,
          role: role,
        },
        { expiresIn: '1d' }
      );

      expect(result).toBe(mockToken);
    });
  });


  describe('signUpWithGoogle', () => {
    const mockGoogleDto = {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: '', // Mot de passe vide pour Google
    };

    it('should create user with Google authentication', async () => {
      // 1️⃣ ARRANGE
      const hashedEmptyPassword = 'hashed_empty_string';
      const createdUser = {
        id: 'user-456',
        fullName: mockGoogleDto.fullName,
        email: mockGoogleDto.email,
        Role: 'USER',
        isTokenExpired: false,
      };

      (argon.hash as jest.Mock).mockResolvedValue(hashedEmptyPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      // 2️⃣ ACT
      const result = await service.signUpWithGoogle(mockGoogleDto);

      // 3️⃣ ASSERT
      expect(argon.hash).toHaveBeenCalledWith(''); // Hash d'une chaîne vide
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(result).toEqual(createdUser);
    });

    it('should handle Google signup even if email exists', async () => {
      // 1️⃣ ARRANGE
      (argon.hash as jest.Mock).mockResolvedValue('hashed');

      const prismaError = new PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        }
      );

      mockPrismaService.user.create.mockRejectedValue(prismaError);

      // 2️⃣ ACT & 3️⃣ ASSERT
      // NOTE : Votre implémentation actuelle ne gère pas ce cas
      // Idéalement, vous devriez retourner l'utilisateur existant
      await expect(service.signUpWithGoogle(mockGoogleDto)).rejects.toThrow();
    });
  });
});