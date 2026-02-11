import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import CheckoutForm from "../../Ui/Tables/CheckoutForm";
import Layout from "../Layout/Layout";
import { AuthStore } from "../../Store/auth/AuthStore";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB_KEY);

export default function Billing() {
  const { user } = AuthStore();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const start_date = new Date();
const end_date = new Date(start_date);  
end_date.setDate(end_date.getDate() + 30);  
    fetch("http://localhost:8080/upgrad/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 2000,
        clientId: user.sub,
        start_date : start_date,
        end_date: end_date,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Paiement session init", data);
        setClientSecret(data.clientSecret);
      })
      .catch(console.error);
  }, [user]);

  if (!clientSecret) {
    return (
      <Layout title="Procédure de paiement">
        Chargement du paiement...
      </Layout>
    );
  }

  return (
    <Layout title="Procédure de paiement">
      <div className="my-3 flex items-center gap-4 text-xl ">
        <div>Abonnez-vous avec seulement </div>
        <div className="bg-green-100 text-green-800 py-1 px-2 rounded-full">
          200 DH/Mois
        </div>
      </div>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "night", // ou "stripe"
            variables: {
              colorPrimary: "#ffff", // slate-900
              colorBackground: "#020617",
              colorText: "#e5e7eb",
              colorTextSecondary: "#94a3b8",
              colorDanger: "#ef4444",
              fontFamily: "Inter, system-ui, sans-serif",
              borderRadius: "12px",
              spacingUnit: "4px",
            },
            rules: {
              ".Input": {
                padding: "12px",
                border: "1px solid #e5e7eb",
                color: "#e5e7eb",
              },
              ".Label": {
                fontWeight: "600",
                color: "#cbd5f5",
              },
            },
          },
        }}
      >
        <CheckoutForm />
      </Elements>
    </Layout>
  );
}
