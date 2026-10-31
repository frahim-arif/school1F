"use client";

import { useState } from "react";
import {
  Settings,
  Save,
  Bell,
  CheckCircle2,
  Percent,
  ClipboardCheck,
} from "lucide-react";


export default function ExamSettingsPage() {


  const [publishResult,setPublishResult] = useState(true);
  const [notification,setNotification] = useState(true);



  return (

    <div className="space-y-6">






      {/* Header */}


      <div>


        <h1 className="
        text-3xl
        font-black
        text-slate-800
        ">
          Exam Settings
        </h1>


        <p className="
        mt-2
        text-sm
        text-slate-500
        ">
          Configure examination rules and result preferences
        </p>


      </div>









      {/* Settings Grid */}



      <div className="
      grid
      gap-6
      lg:grid-cols-2
      ">






        {/* Marks Settings */}


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

              <Percent size={22}/>

            </div>



            <h2 className="
            text-lg
            font-black
            text-slate-800
            ">
              Marks Configuration
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
                Passing Percentage
              </label>



              <input

              defaultValue="33"

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
                Maximum Marks
              </label>



              <input

              defaultValue="100"

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












        {/* Result Settings */}


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

              <ClipboardCheck size={22}/>

            </div>



            <h2 className="
            text-lg
            font-black
            text-slate-800
            ">
              Result Settings
            </h2>


          </div>






          <div className="
          mt-6
          space-y-5
          ">





            <div className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            p-4
            ">


              <div>


                <h3 className="
                font-bold
                text-slate-800
                ">
                  Auto Publish Result
                </h3>


                <p className="
                text-sm
                text-slate-500
                ">
                  Publish result after marks approval
                </p>


              </div>





              <button

              onClick={()=>setPublishResult(!publishResult)}

              className={`
              h-7
              w-14
              rounded-full
              transition

              ${
                publishResult
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
                  publishResult
                  ?
                  "translate-x-8"
                  :
                  "translate-x-1"
                }

                `}
                />

              </button>



            </div>








            <div className="
            flex
            items-center
            justify-between
            rounded-xl
            border
            p-4
            ">


              <div>


                <h3 className="
                font-bold
                text-slate-800
                ">
                  Send Notification
                </h3>


                <p className="
                text-sm
                text-slate-500
                ">
                  Notify students and parents
                </p>


              </div>





              <button

              onClick={()=>setNotification(!notification)}

              className={`
              h-7
              w-14
              rounded-full
              transition

              ${
                notification
                ?
                "bg-indigo-600"
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









        {/* Attendance Requirement */}


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
            bg-orange-100
            p-3
            text-orange-600
            ">

              <CheckCircle2 size={22}/>

            </div>


            <h2 className="
            text-lg
            font-black
            ">
              Attendance Rule
            </h2>


          </div>





          <div className="mt-6">


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Minimum Attendance Required
            </label>


            <input

            defaultValue="75"

            className="
            mt-2
            w-full
            rounded-xl
            border
            px-4
            py-3
            "

            />


          </div>



        </div>









        {/* General */}


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
            bg-purple-100
            p-3
            text-purple-600
            ">

              <Settings size={22}/>

            </div>



            <h2 className="
            text-lg
            font-black
            ">
              General Settings
            </h2>


          </div>




          <p className="
          mt-5
          text-sm
          text-slate-500
          ">
            Manage exam related system preferences and controls.
          </p>


        </div>






      </div>








      {/* Save Button */}


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