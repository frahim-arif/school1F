"use client";

import { useState } from "react";
import {
  Plus,
  Award,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";


export default function GradingPage() {


  const grades = [

    {
      id:1,
      grade:"A+",
      min:"90",
      max:"100",
      point:"10",
      remark:"Excellent"
    },


    {
      id:2,
      grade:"A",
      min:"80",
      max:"89",
      point:"9",
      remark:"Very Good"
    },


    {
      id:3,
      grade:"B+",
      min:"70",
      max:"79",
      point:"8",
      remark:"Good"
    },


    {
      id:4,
      grade:"C",
      min:"33",
      max:"59",
      point:"5",
      remark:"Average"
    },


    {
      id:5,
      grade:"F",
      min:"0",
      max:"32",
      point:"0",
      remark:"Fail"
    }


  ];





  return (

    <div className="space-y-6">






      {/* Header */}


      <div className="
      flex
      flex-col
      gap-4
      md:flex-row
      md:items-center
      md:justify-between
      ">


        <div>


          <h1 className="
          text-3xl
          font-black
          text-slate-800
          ">
            Grade System
          </h1>



          <p className="
          mt-2
          text-sm
          text-slate-500
          ">
            Manage marks percentage and grade rules
          </p>



        </div>






        <button
        className="
        flex
        items-center
        gap-2
        rounded-xl
        bg-indigo-600
        px-5
        py-3
        text-sm
        font-bold
        text-white
        shadow-lg
        shadow-indigo-200
        hover:bg-indigo-700
        "
        >

          <Plus size={18}/>

          Add Grade

        </button>


      </div>









      {/* Info Card */}


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

            <Award size={22}/>

          </div>



          <div>


            <h2 className="
            font-black
            text-slate-800
            ">
              Automatic Grade Calculation
            </h2>


            <p className="
            text-sm
            text-slate-500
            ">
              System will calculate grades automatically based on marks
            </p>


          </div>


        </div>


      </div>









      {/* Table */}



      <div className="
      overflow-hidden
      rounded-2xl
      border
      bg-white
      shadow-sm
      ">



        <div className="overflow-x-auto">


          <table className="w-full text-left">


            <thead
            className="
            bg-slate-50
            text-sm
            text-slate-500
            ">


              <tr>


                <th className="px-6 py-4">
                  Grade
                </th>


                <th className="px-6 py-4">
                  Minimum %
                </th>


                <th className="px-6 py-4">
                  Maximum %
                </th>


                <th className="px-6 py-4">
                  Grade Point
                </th>


                <th className="px-6 py-4">
                  Remark
                </th>


                <th className="px-6 py-4">
                  Action
                </th>


              </tr>


            </thead>








            <tbody>



            {
              grades.map((item)=>(


                <tr
                key={item.id}
                className="
                border-t
                hover:bg-slate-50
                "
                >



                  <td className="
                  px-6
                  py-4
                  ">


                    <span className="
                    rounded-full
                    bg-indigo-100
                    px-3
                    py-1
                    text-sm
                    font-black
                    text-indigo-700
                    ">
                      {item.grade}
                    </span>


                  </td>





                  <td className="
                  px-6
                  py-4
                  text-slate-600
                  ">
                    {item.min}%
                  </td>





                  <td className="
                  px-6
                  py-4
                  text-slate-600
                  ">
                    {item.max}%
                  </td>





                  <td className="
                  px-6
                  py-4
                  text-slate-600
                  ">
                    {item.point}
                  </td>





                  <td className="
                  px-6
                  py-4
                  text-slate-600
                  ">
                    {item.remark}
                  </td>





                  <td className="
                  px-6
                  py-4
                  ">


                    <div className="flex gap-2">


                      <button
                      className="
                      rounded-lg
                      bg-blue-100
                      p-2
                      text-blue-700
                      "
                      >

                        <Pencil size={16}/>

                      </button>



                      <button
                      className="
                      rounded-lg
                      bg-red-100
                      p-2
                      text-red-700
                      "
                      >

                        <Trash2 size={16}/>

                      </button>


                    </div>


                  </td>




                </tr>


              ))
            }



            </tbody>


          </table>


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
        bg-green-600
        px-6
        py-3
        font-bold
        text-white
        shadow-lg
        shadow-green-200
        hover:bg-green-700
        "
        >

          <Save size={18}/>

          Save Grade Settings

        </button>


      </div>




    </div>

  );

}