"use client";

import {
  School,
  Upload,
  UserRound,
  Phone,
  Mail,
  Globe,
  MapPin,
  Save,
} from "lucide-react";


export default function SchoolProfilePage(){


  return (

    <div className="space-y-6">






      {/* Header */}


      <div>


        <h1 className="
        text-3xl
        font-black
        text-slate-800
        ">
          School Profile
        </h1>


        <p className="
        mt-2
        text-sm
        text-slate-500
        ">
          Manage school information and profile details
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








          {/* School Name */}


          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              School Name
            </label>


            <div className="
            mt-2
            flex
            items-center
            gap-3
            rounded-xl
            border
            px-4
            ">


              <School
              size={18}
              className="text-indigo-600"
              />


              <input

              defaultValue="Modern Public School"

              className="
              w-full
              py-3
              outline-none
              "

              />


            </div>


          </div>









          {/* Principal */}


          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Principal Name
            </label>


            <div className="
            mt-2
            flex
            items-center
            gap-3
            rounded-xl
            border
            px-4
            ">


              <UserRound
              size={18}
              className="text-green-600"
              />


              <input

              defaultValue="Dr. Ahmed Khan"

              className="
              w-full
              py-3
              outline-none
              "

              />


            </div>


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
            gap-3
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
            gap-3
            rounded-xl
            border
            px-4
            ">


              <Mail
              size={18}
              className="text-red-500"
              />


              <input

              placeholder="school@gmail.com"

              className="
              w-full
              py-3
              outline-none
              "

              />


            </div>


          </div>









          {/* Website */}


          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              Website
            </label>


            <div className="
            mt-2
            flex
            items-center
            gap-3
            rounded-xl
            border
            px-4
            ">


              <Globe
              size={18}
              className="text-blue-600"
              />


              <input

              placeholder="www.school.com"

              className="
              w-full
              py-3
              outline-none
              "

              />


            </div>


          </div>









          {/* Logo */}


          <div>


            <label className="
            text-sm
            font-bold
            text-slate-600
            ">
              School Logo
            </label>


            <label className="
            mt-2
            flex
            cursor-pointer
            items-center
            gap-3
            rounded-xl
            border
            px-4
            py-3
            text-sm
            text-slate-500
            ">


              <Upload size={18}/>


              Upload Logo


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
            School Address
          </label>



          <div className="
          mt-2
          flex
          gap-3
          rounded-xl
          border
          p-4
          ">


            <MapPin
            size={20}
            className="text-purple-600"
            />


            <textarea

            rows="4"

            defaultValue="School Main Road, City, State"

            className="
            w-full
            outline-none
            "

            />


          </div>


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


            Save Profile


          </button>


        </div>





      </div>





    </div>

  );

}