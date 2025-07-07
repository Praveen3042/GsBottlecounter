import React from 'react'
import { useAuth } from '../../contexts/authContext'
import { Iot } from './Iot.jsx'
import { GSBottle_counter } from './GSBottle_counter.jsx'
import { Iotchiller } from './Iotchiller.jsx'
import {Iot_chiller} from './Iot_chiller.jsx'
import { Iot_chiller_pcl } from './Iot_chiller_pcl.jsx'


const Home = () => {
    const { currentUser } = useAuth()
    return (
        // <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div>
        <div>
            {/* <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div> */}
            <Iot/>    {/* firat m */}
            <GSBottle_counter/>  {/* 2nd m2 resd */}
            <Iotchiller/>  {/* firat m */}
            <Iot_chiller/>
            <Iot_chiller_pcl/> 
            
         
            
        </div>
    )
}

export default Home