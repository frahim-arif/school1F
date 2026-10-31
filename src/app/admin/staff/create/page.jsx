"use client";

import {
  UserPlus,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  BriefcaseBusiness,
  Upload,
  Save,
} from "lucide-react";


export default function CreateStaffPage(){


  return (

    <div className="space-y-6">





      {/* Header */}


      <div>


        <h1 className="
        text-3xl
        font-black
        text-slate-800
        ">
          Add New Staff
        </h1>


        <p className="
        mt-2
        text-sm
        text-slate-500
        ">
          Create staff profile and manage employee details
        </p>


      </div>









      {/* Form */}



      <div className="
      rounded-2xl
      border
      bg-white
      p-6
      shadow-sm
      ">


        <div className="
        grid
        gap-6
        md:grid-cols-2
        ">








          {/* Name */}


          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Full Name
            </label>


            <div className="
            mt-2
            flex
            items-center
            gap-2
            rounded-xl
            border
            px-4
            ">


              <UserRound
              size={18}
              className="text-indigo-600"
              />


              <input

              placeholder="Enter full name"

              className="
              w-full
              py-3
              outline-none
              "

              />


            </div>


          </div>









          {/* Employee ID */}


          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Employee ID
            </label>


            <div className="
            mt-2
            flex
            items-center
            gap-2
            rounded-xl
            border
            px-4
            ">


              <UserPlus
              size={18}
              className="text-green-600"
              />


              <input

              placeholder="EMP-001"

              className="
              w-full
              py-3
              outline-none
              "

              />


            </div>


          </div>









          {/* Role */}



          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Role
            </label>


            <div className="
            mt-2
            flex
            items-center
            gap-2
            rounded-xl
            border
            px-4
            ">


              <BriefcaseBusiness
              size={18}
              className="text-purple-600"
              />


              <select

              className="
              w-full
              py-3
              outline-none
              "

              >


                <option>
                  Teacher
                </option>


                <option>
                  Accountant
                </option>


                <option>
                  Librarian
                </option>


                <option>
                  Receptionist
                </option>


              </select>


            </div>


          </div>









          {/* Department */}



          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Department
            </label>



            <select

            className="
            mt-2
            w-full
            rounded-xl
            border
            px-4
            py-3
            outline-none
            "

            >


              <option>
                Mathematics
              </option>


              <option>
                Science
              </option>


              <option>
                Administration
              </option>


            </select>


          </div>









          {/* Phone */}



          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Phone Number
            </label>


            <div className="
            mt-2
            flex
            items-center
            gap-2
            rounded-xl
            border
            px-4
            ">


              <Phone
              size={18}
              className="text-orange-500"
              />


              <input

              placeholder="9876543210"

              className="
              w-full
              py-3
              outline-none
              "

              />


            </div>


          </div>









          {/* Email */}



          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Email Address
            </label>


            <div className="
            mt-2
            flex
            items-center
            gap-2
            rounded-xl
            border
            px-4
            ">


              <Mail
              size={18}
              className="text-red-500"
              />


              <input

              placeholder="email@example.com"

              className="
              w-full
              py-3
              outline-none
              "

              />


            </div>


          </div>









          {/* Joining Date */}



          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Joining Date
            </label>


            <div className="
            mt-2
            flex
            items-center
            gap-2
            rounded-xl
            border
            px-4
            ">


              <CalendarDays
              size={18}
              className="text-blue-600"
              />


              <input

              type="date"

              className="
              w-full
              py-3
              outline-none
              "

              />


            </div>


          </div>









          {/* Salary */}



          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Monthly Salary
            </label>



            <input

            placeholder="₹ 25000"

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









          {/* Photo */}



          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Profile Photo
            </label>



            <label className="
            mt-2
            flex
            cursor-pointer
            items-center
            gap-2
            rounded-xl
            border
            px-4
            py-3
            text-sm
            text-slate-500
            ">


              <Upload size={18}/>


              Upload Photo


              <input
              type="file"
              className="hidden"
              />


            </label>


          </div>






        </div>









        {/* Address */}



        <div className="mt-6">


          <label className="
          text-sm
          font-bold
          text-slate-600
          ">
            Address
          </label>



          <textarea

          rows="4"

          placeholder="Enter address"

          className="
          mt-2
          w-full
          rounded-xl
          border
          p-4
          outline-none
          "

          />


        </div>









        {/* Save */}



        <div className="
        mt-8
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


            Save Staff


          </button>


        </div>





      </div>





    </div>

  );

}