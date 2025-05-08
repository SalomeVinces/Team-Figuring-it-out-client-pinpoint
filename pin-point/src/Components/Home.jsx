import React from 'react'

const Home = () => {

  return (
    <div className='page text-center flex flex-col gap-6'>
      <h1 className='text-3xl font-bold text-primary'>Welcome Home User!</h1>
      {/* Adding officials and bills  */}
      <div className='flex flex-row gap-x-6 justify-center items-center pb-4 '>
        <div className="stats bg-base-100 border-white-300 border">
          <div className="stat">
            <div className="stat-title">House/Senate Officials</div>
            <div className="stat-value">by zipcode</div>
            <div className="stat-actions">
              {/* <button className="btn btn-xs btn-success"></button> */}
            </div>
          </div>
        </div>
        {/* placeholder for map */}
        <div className='stats bg-base-100 border-white-300 border'>
          Map
        </div>
        <div className="stats bg-base-100 border-white-300 border">
          <div className="stat">
            <div className="stat-title">Bills</div>
            <div className="stat-value">Recently passed</div>
            <div className="stat-actions">
              {/* <button className="btn btn-xs btn-success"></button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home