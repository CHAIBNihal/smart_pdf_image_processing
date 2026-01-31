import React, { type FC } from 'react'

interface HeaderPropos {
    title : string;
    paragraph : string;
    icon : React.ReactNode
}
const Header: FC<HeaderPropos> = ({title, paragraph, icon}) => {
  return (
     <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700">
                  {icon}
                </div>
               <div>
                 <h1 className="text-2xl font-bold text-white">
                  {title}
                </h1>
                <p className="text-slate-400">
                {paragraph}
              </p>
               </div>
              </div>
              
            </div>
  )
}

export default Header
