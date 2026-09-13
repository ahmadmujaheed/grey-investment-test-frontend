import { useState } from "react";
import { Skeleton, Empty, Tag, Pagination } from "antd";
import {
  ArrowRight,
  CalendarDays,
  Hash,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);


const statusColor = {
  pending: "gold",
  running: "blue",
  completed: "green",
  archived: "default",
};


// fallback image
const dummyImage =
  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=60";


const RecentInvestments = ({
  investments = [],
  loading = false,
}) => {

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;


  const paginatedInvestments = investments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  if (loading) {
    return (
      <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-5">
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    );
  }


  return (
    <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-5">


      {/* Header */}
      <div className="flex items-center justify-between mb-5">

        <div>
          <h2 className="text-white font-semibold text-lg">
            Recent Investments
          </h2>

          <p className="text-slate-400 text-sm">
            Latest investments on the platform
          </p>
        </div>

      </div>



      {investments.length === 0 ? (

        <Empty
          description={
            <span className="text-slate-400">
              No investments found
            </span>
          }
        />

      ) : (

        <>


          {/* Investment List */}
          <div className="space-y-3">


            {paginatedInvestments.map((item) => (

              <Link
                key={item.investmentId}
                to={`/dashboard/investment/${item.investmentId}`}
                className="block"
              >


                <div
                  className="
                    rounded-lg 
                    border 
                    border-slate-700 
                    bg-[#111827] 
                    hover:border-emerald-500 
                    transition-all 
                    duration-200 
                    p-3
                  "
                >


                  <div className="flex items-center gap-3">


                    {/* Image */}

                    <img
                      src={
                        item.image?.url ||
                        dummyImage
                      }
                      alt={item.title}
                      className="
                        w-14 
                        h-14 
                        rounded-lg 
                        object-cover
                        flex-shrink-0
                      "
                    />



                    {/* Details */}

                    <div className="flex-1 min-w-0">


                      <div className="flex justify-between items-center gap-2">


                        <h3
                          className="
                            text-white 
                            font-semibold 
                            truncate
                            text-sm
                            capitalize
                          "
                        >
                          {item.title}
                        </h3>


                        <Tag
                          color={
                            statusColor[item.status] ||
                            "default"
                          }
                          className="capitalize"
                        >
                          {item.status}
                        </Tag>


                      </div>



                      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 mt-2">


                        <div className="flex items-center gap-1 text-xs text-slate-400">

                          <Hash size={13}/>

                          <span className="truncate">
                            {item.reference}
                          </span>

                        </div>



                        <div className="flex items-center gap-1 text-xs text-slate-400">

                          <Wallet size={13}/>

                          {formatMoney(
                            item.totalAllocated
                          )}

                        </div>




                        <div className="flex items-center gap-1 text-xs text-slate-400">

                          <CalendarDays size={13}/>

                          {new Date(
                            item.createdAt
                          ).toLocaleDateString()}

                        </div>



                      </div>


                    </div>



                    <ArrowRight
                      className="
                        text-slate-500
                        flex-shrink-0
                      "
                      size={18}
                    />


                  </div>


                </div>


              </Link>

            ))}


          </div>




          {/* Pagination */}

          {investments.length > pageSize && (

            <div className="flex justify-center mt-5">


              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={investments.length}
                onChange={(page)=>setCurrentPage(page)}
                size="small"
                showSizeChanger={false}
              />


            </div>

          )}


        </>

      )}


    </div>
  );
};


export default RecentInvestments;