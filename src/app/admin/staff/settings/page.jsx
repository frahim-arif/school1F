"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  Bell,
  CalendarDays,
  WalletCards,
  UserCog,
} from "lucide-react";


export default function StaffSettingsPage(){


  const [notification,setNotification] = useState(true);
  const [autoSalary,setAutoSalary] = useState(false);
  const [leaveApproval,setLeaveApproval] = useState(true);



  return (

    <div className="space-y-6">






      {/* Header */}


      <div>


        <h1 className="
        text-3xl
        font-black
        text-slate-800
        ">
          Staff Settings
        </h1>


        <p className="
        mt-2
        text-sm
        text-slate-500
        ">
          Configure staff management preferences
        </p>


      </div>









      {/* Settings Cards */}



      <div className="
      grid
      gap-6
      lg:grid-cols-2
      ">








        {/* Employee Settings */}



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
            bg-indigo-100
            p-3
            text-indigo-600
            ">


              <UserCog size={22}/>


            </div>



            <h2 className="
            text-lg
            font-black
            ">
              Employee Settings
            </h2>


          </div>







          <div className="
          mt-6
          space-y-5
          ">



            <div>


              <label className="
              text-sm
              font-bold
              text-slate-600
              ">
                Employee ID Format
              </label>


              <input

              defaultValue="EMP-001"

              className="
              mt-2
              w-full
              rounded-xl
              border
              px-4
              py-3
              outline-none
              "

              />


            </div>






            <div>


              <label className="
              text-sm
              font-bold
              text-slate-600
              ">
                Working Hours
              </label>


              <input

              defaultValue="9 AM - 5 PM"

              className="
              mt-2
              w-full
              rounded-xl
              border
              px-4
              py-3
              outline-none
              "

              />


            </div>



          </div>



        </div>









        {/* Salary Settings */}



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


              <WalletCards size={22}/>


            </div>



            <h2 className="
            text-lg
            font-black
            ">
              Salary Settings
            </h2>


          </div>






          <div className="mt-6">


            <div className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            p-4
            ">


              <div>


                <h3 className="font-bold">
                  Auto Salary Generation
                </h3>


                <p className="
                text-sm
                text-slate-500
                ">
                  Generate monthly salary automatically
                </p>


              </div>





              <button

              onClick={()=>setAutoSalary(!autoSalary)}

              className={`
              h-7
              w-14
              rounded-full

              ${
                autoSalary
                ?
                "bg-green-600"
                :
                "bg-slate-300"
              }

              `}
              >


                <span

                className={`
                block
                h-5
                w-5
                rounded-full
                bg-white
                transition

                ${
                  autoSalary
                  ?
                  "translate-x-8"
                  :
                  "translate-x-1"
                }

                `}
                />


              </button>


            </div>


          </div>



        </div>









        {/* Leave Settings */}



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


            <CalendarDays
            className="text-orange-500"
            />


            <h2 className="
            text-lg
            font-black
            ">
              Leave Settings
            </h2>


          </div>






          <div className="
          mt-6
          flex
          items-center
          justify-between
          rounded-xl
          border
          p-4
          ">


            <div>


              <h3 className="font-bold">
                Leave Approval
              </h3>


              <p className="
              text-sm
              text-slate-500
              ">
                Admin approval required for leave
              </p>


            </div>





            <button

            onClick={()=>setLeaveApproval(!leaveApproval)}

            className={`
            h-7
            w-14
            rounded-full

            ${
              leaveApproval
              ?
              "bg-orange-500"
              :
              "bg-slate-300"
            }

            `}
            >


              <span

              className={`
              block
              h-5
              w-5
              rounded-full
              bg-white
              transition

              ${
                leaveApproval
                ?
                "translate-x-8"
                :
                "translate-x-1"
              }

              `}
              />


            </button>



          </div>



        </div>









        {/* Notification Settings */}



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


            <Bell
            className="text-purple-600"
            />


            <h2 className="
            text-lg
            font-black
            ">
              Notification Settings
            </h2>


          </div>







          <div className="
          mt-6
          flex
          items-center
          justify-between
          rounded-xl
          border
          p-4
          ">


            <div>


              <h3 className="font-bold">
                Staff Alerts
              </h3>


              <p className="
              text-sm
              text-slate-500
              ">
                Send updates to staff members
              </p>


            </div>





            <button

            onClick={()=>setNotification(!notification)}

            className={`
            h-7
            w-14
            rounded-full

            ${
              notification
              ?
              "bg-purple-600"
              :
              "bg-slate-300"
            }

            `}
            >


              <span

              className={`
              block
              h-5
              w-5
              rounded-full
              bg-white
              transition

              ${
                notification
                ?
                "translate-x-8"
                :
                "translate-x-1"
              }

              `}
              />


            </button>



          </div>



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

          Save Settings


        </button>


      </div>





    </div>

  );

}