"use client";

import { useState } from "react";
import {
  UsersRound,
  ShieldCheck,
  Check,
  Save,
  UserCog,
} from "lucide-react";


export default function RolesPage(){


  const [permissions,setPermissions] = useState({

    dashboard:true,
    students:true,
    fees:true,
    attendance:true,
    exams:false,
    settings:false

  });





  const togglePermission=(key)=>{

    setPermissions({

      ...permissions,

      [key]:!permissions[key]

    });

  };





  const roles=[

    {
      name:"Administrator",
      desc:"Full system access",
      users:2
    },


    {
      name:"Teacher",
      desc:"Academic module access",
      users:45
    },


    {
      name:"Accountant",
      desc:"Fees and finance access",
      users:5
    },


  ];






  return (

    <div className="space-y-6">







      {/* Header */}


      <div>


        <h1 className="
        text-3xl
        font-black
        text-slate-800
        ">
          Roles & Permissions
        </h1>


        <p className="
        mt-2
        text-sm
        text-slate-500
        ">
          Manage user roles and access permissions
        </p>


      </div>









      {/* Roles */}



      <div className="
      grid
      gap-5
      md:grid-cols-3
      ">


      {
        roles.map((role,index)=>(


          <div

          key={index}

          className="
          rounded-2xl
          border
          bg-white
          p-6
          shadow-sm
          "

          >



            <div className="
            flex
            items-center
            justify-between
            ">


              <div className="
              rounded-xl
              bg-indigo-100
              p-3
              text-indigo-600
              ">


                <UserCog size={22}/>


              </div>



              <span className="
              rounded-full
              bg-green-100
              px-3
              py-1
              text-xs
              font-bold
              text-green-700
              ">
                {role.users} Users
              </span>


            </div>





            <h2 className="
            mt-5
            text-xl
            font-black
            ">
              {role.name}
            </h2>


            <p className="
            mt-2
            text-sm
            text-slate-500
            ">
              {role.desc}
            </p>



          </div>


        ))
      }


      </div>









      {/* Permission Panel */}



      <div className="
      rounded-2xl
      border
      bg-white
      p-6
      shadow-sm
      ">



        <div className="
        flex
        items-center
        gap-3
        ">


          <div className="
          rounded-xl
          bg-green-100
          p-3
          text-green-600
          ">


            <ShieldCheck size={22}/>


          </div>



          <div>


            <h2 className="
            text-lg
            font-black
            ">
              Admin Permissions
            </h2>


            <p className="
            text-sm
            text-slate-500
            ">
              Control module access
            </p>


          </div>



        </div>









        <div className="
        mt-6
        grid
        gap-4
        md:grid-cols-2
        ">


        {
          Object.keys(permissions).map((item)=>(


            <div

            key={item}

            className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            p-4
            "

            >



              <div>


                <h3 className="
                font-bold
                capitalize
                ">
                  {item}
                </h3>


                <p className="
                text-xs
                text-slate-500
                ">
                  Module access permission
                </p>


              </div>





              <button

              onClick={()=>togglePermission(item)}

              className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full

              ${
                permissions[item]
                ?
                "bg-green-600 text-white"
                :
                "bg-slate-200 text-slate-400"
              }

              `}

              >


                {
                  permissions[item] &&
                  <Check size={18}/>
                }


              </button>



            </div>


          ))
        }


        </div>





      </div>









      {/* Save */}



      <div className="
      flex
      justify-end
      ">


        <button

        className="
        flex
        items-center
        gap-2
        rounded-xl
        bg-indigo-600
        px-6
        py-3
        font-bold
        text-white
        shadow-lg
        shadow-indigo-200
        hover:bg-indigo-700
        "

        >


          <Save size={18}/>


          Save Permissions


        </button>



      </div>





    </div>

  );

}