"use client";

import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "emerald",
  growth = "+12%",
}) {


  const colors = {

    emerald:{
      bg:"bg-emerald-50",
      icon:"bg-emerald-500",
      text:"text-emerald-600",
      border:"border-emerald-100"
    },


    blue:{
      bg:"bg-blue-50",
      icon:"bg-blue-500",
      text:"text-blue-600",
      border:"border-blue-100"
    },


    amber:{
      bg:"bg-amber-50",
      icon:"bg-amber-500",
      text:"text-amber-600",
      border:"border-amber-100"
    },


    red:{
      bg:"bg-red-50",
      icon:"bg-red-500",
      text:"text-red-600",
      border:"border-red-100"
    },


    purple:{
      bg:"bg-purple-50",
      icon:"bg-purple-500",
      text:"text-purple-600",
      border:"border-purple-100"
    },


    cyan:{
      bg:"bg-cyan-50",
      icon:"bg-cyan-500",
      text:"text-cyan-600",
      border:"border-cyan-100"
    },


    orange:{
      bg:"bg-orange-50",
      icon:"bg-orange-500",
      text:"text-orange-600",
      border:"border-orange-100"
    },


  };



  const c = colors[color] || colors.emerald;



  return (

    <div

      className={`
      rounded-3xl
      border
      ${c.border}
      ${c.bg}
      p-6
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-xl
      `}

    >



      <div className="
      flex
      items-center
      justify-between
      gap-4
      ">


        {/* Content */}

        <div>


          <p className="
          text-sm
          font-semibold
          text-slate-500
          ">

            {title}

          </p>



          <h2 className="
          mt-2
          text-4xl
          font-black
          text-slate-800
          ">

            {value}

          </h2>




          <div

          className={`
          mt-3
          inline-flex
          items-center
          gap-1
          rounded-full
          bg-white
          px-3
          py-1
          text-sm
          font-bold
          ${c.text}
          shadow-sm
          `}

          >

            <ArrowUpRight size={16}/>

            {growth}

          </div>



        </div>






        {/* Icon */}


        <div

        className={`
        flex
        h-16
        w-16
        shrink-0
        items-center
        justify-center
        rounded-2xl
        text-white
        shadow-lg
        ${c.icon}
        `}

        >

          {
            Icon && <Icon size={30}/>
          }


        </div>



      </div>



    </div>


  );

}