import React from 'react'
import { useAuth } from '../../contexts/authContext'
import { Iot } from './Iot.jsx'
import { GSBottle_counter } from './GSBottle_counter.jsx'
import { Iotchiller } from './Iotchiller.jsx'
import {Iot_chiller} from './Iot_chiller.jsx'


const Home = () => {
    const { currentUser } = useAuth()
    return (
        // <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div>
        <div>
            {/* <div className='text-2xl font-bold pt-14'>Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.</div> */}
            <Iot/>
            <GSBottle_counter/>
            <Iotchiller/>
            {/* <Iot_chiller/> */}
            
         
            
        </div>
    )
}

export default Home