"use client";

import {
  DatabaseBackup,
  Download,
  UploadCloud,
  Clock3,
  HardDrive,
  Save,
} from "lucide-react";


export default function BackupPage(){


  const backups=[

    {
      id:1,
      name:"ERP_Backup_23_July_2026",
      size:"245 MB",
      date:"23 July 2026",
      status:"Completed"
    },


    {
      id:2,
      name:"ERP_Backup_15_July_2026",
      size:"230 MB",
      date:"15 July 2026",
      status:"Completed"
    },


    {
      id:3,
      name:"ERP_Backup_01_July_2026",
      size:"210 MB",
      date:"01 July 2026",
      status:"Completed"
    }

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
          Backup Management
        </h1>


        <p className="
        mt-2
        text-sm
        text-slate-500
        ">
          Manage database backup and restore options
        </p>


      </div>









      {/* Cards */}



      <div className="
      grid
      gap-5
      md:grid-cols-3
      ">






        <div className="
        rounded-2xl
        border
        bg-white
        p-6
        shadow-sm
        ">


          <DatabaseBackup
          size={28}
          className="text-indigo-600"
          />


          <h2 className="
          mt-4
          text-xl
          font-black
          ">
            Database Backup
          </h2>


          <p className="
          mt-2
          text-sm
          text-slate-500
          ">
            Last backup completed today
          </p>


        </div>








        <div className="
        rounded-2xl
        border
        bg-white
        p-6
        shadow-sm
        ">


          <HardDrive
          size={28}
          className="text-green-600"
          />


          <h2 className="
          mt-4
          text-xl
          font-black
          ">
            Storage Used
          </h2>


          <p className="
          mt-2
          text-sm
          text-slate-500
          ">
            2.4 GB / 10 GB
          </p>


        </div>








        <div className="
        rounded-2xl
        border
        bg-white
        p-6
        shadow-sm
        ">


          <Clock3
          size={28}
          className="text-orange-500"
          />


          <h2 className="
          mt-4
          text-xl
          font-black
          ">
            Auto Backup
          </h2>


          <p className="
          mt-2
          text-sm
          text-slate-500
          ">
            Daily at 12:00 AM
          </p>


        </div>



      </div>









      {/* Actions */}



      <div className="
      rounded-2xl
      border
      bg-white
      p-6
      shadow-sm
      ">



        <h2 className="
        text-lg
        font-black
        ">
          Backup Actions
        </h2>





        <div className="
        mt-5
        flex
        flex-col
        gap-4
        md:flex-row
        ">



          <button

          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-indigo-600
          px-6
          py-3
          font-bold
          text-white
          "

          >


            <Save size={18}/>


            Create Backup


          </button>







          <button

          className="
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          px-6
          py-3
          font-bold
          text-slate-700
          "

          >


            <UploadCloud size={18}/>


            Restore Backup


          </button>



        </div>



      </div>









      {/* History */}



      <div className="
      overflow-hidden
      rounded-2xl
      border
      bg-white
      shadow-sm
      ">



        <div className="
        border-b
        p-5
        ">


          <h2 className="
          text-lg
          font-black
          ">
            Backup History
          </h2>


        </div>








        <div className="overflow-x-auto">


          <table className="w-full text-left">


            <thead className="
            bg-slate-50
            text-sm
            text-slate-500
            ">


              <tr>


                <th className="px-6 py-4">
                  Backup Name
                </th>


                <th className="px-6 py-4">
                  Size
                </th>


                <th className="px-6 py-4">
                  Date
                </th>


                <th className="px-6 py-4">
                  Action
                </th>


              </tr>


            </thead>








            <tbody>


            {
              backups.map((item)=>(


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
                  font-bold
                  ">
                    {item.name}
                  </td>



                  <td className="px-6 py-4">
                    {item.size}
                  </td>



                  <td className="px-6 py-4">
                    {item.date}
                  </td>



                  <td className="px-6 py-4">


                    <button

                    className="
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-green-100
                    px-4
                    py-2
                    text-sm
                    font-bold
                    text-green-700
                    "

                    >


                      <Download size={16}/>


                      Download


                    </button>


                  </td>



                </tr>


              ))
            }



            </tbody>



          </table>


        </div>



      </div>





    </div>

  );

}