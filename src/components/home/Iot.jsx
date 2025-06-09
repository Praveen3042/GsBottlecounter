import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set } from 'firebase/database';

import "./dnm.css"
import { app } from "../../firebase/firebase";



const database = getDatabase(app);
console.log(database)

export const Iot = () => {
    const [records, setRecords] = useState([]);

    const [writeList, setWriteList] = useState([
        {
            data: "0",
            data_type: 0,
            request_type: 5,
            starting_reg_addr: 542,
        },
        {
            data: "1",
            data_type: 0,
            request_type: 5,
            starting_reg_addr: 543,
        },
        {
            data: "0",
            data_type: 0,
            request_type: 5,
            starting_reg_addr: 548,
        },
        {
            data: "2",
            data_type: 7,
            request_type: 16,
            starting_reg_addr: 1576
        },

    ]);



    //read useeffect
    useEffect(() => {
        const fetchData = () => {
            // Reference the "read" path in the Firebase Realtime Database
            const dataRef = ref(database, 'read');

            // Set up a listener that triggers whenever data changes
            onValue(dataRef, (snapshot) => {
                const data = snapshot.val();
                console.log("Raw data:", data); // Log raw data for debugging

                if (data) {
                    const extractedData = []; // Array to store processed records

                    // Loop through each top-level entry
                    Object.entries(data).forEach(([entryId, entryValue]) => {
                        const { ts, values } = entryValue;

                        // Extract required fields
                        if (values) {
                            const {
                                bottle_count,
                                counter_reset,
                                plc_status,
                                pulse,
                                stop_plc,
                            } = values;

                            extractedData.push({
                                ts,
                                bottle_count,
                                counter_reset,
                                plc_status,
                                pulse,
                                stop_plc,
                            });
                        }
                    });

                    setRecords(extractedData); // Save processed data to state
                } else {
                    setRecords([]); // No data found, set state to empty
                }
            });
        };

        fetchData(); // Initial fetch
    }, []);



    //write
    // Handle updates to the data field for each object
    const handleDataChange = (index, newValue) => {
        setWriteList((prevList) =>
            prevList.map((item, i) =>
                i === index ? { ...item, data: newValue } : item
            )
        );
    };

    // Prepare the structure for writing
    const prepareWriteData = () => {
        return {
            method: "do_mb_write",
            params: {
                device_name: "plc_device",
                write_list: writeList,
            },
        };
    };

    // Write data to Firebase
    const handleWrite = async () => {
        const writeData = prepareWriteData();
        const writeRef = ref(database, "write");
        try {
            await set(writeRef, writeData);
            console.log("Data successfully written to wread:", writeData);
        } catch (error) {
            console.error("Error writing data to wread:", error);
        }
    };


    const fieldNames = ["Counter Reset", "Pulse", "stop_plc"];


    return (
        <div className='MainCon1' >
            <h3>Bottle_counter</h3>

            {/* <button onClick={exportToCSV} style={{ marginBottom: "1rem", padding: "10px", background: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
        Export to CSV
      </button> */}


            <div>




                <div className="writ1">
                    {/* reading part */}

                    {records.length === 0 ? (
                        <p>No records found</p>
                    ) : (
                        <table className='Mtable'>
                            <thead>
                                <tr>
                                    <th>Bottle Count</th>
                                    <th>PLC Status</th>

                                </tr>
                            </thead>
                            <tbody>
                                {[...records].reverse().slice(0, 1).map((record, index) => (
                                    <tr key={index}>
                                        <td>{record.bottle_count}</td>
                                        <td>{record.plc_status === 1 ? "OFF" : "ON"}</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>



                    )
                    }


                    {/* write part */}

                    {writeList.slice(0, 3).map((item, index) => (
                        <div key={index} className="write-item">
                            <div>
                                <strong>{fieldNames[index] || `Control ${index + 1}`}:</strong>{" "}
                                <select
                                    value={item.data}
                                    onChange={(e) => handleDataChange(index, e.target.value)}
                                >
                                    <option value="1">On</option>
                                    <option value="0">Off</option>
                                </select>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={handleWrite}
                        style={{
                            padding: "20px 20px",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            marginTop: "20px",
                            marginBottom: "10px",
                            borderRadius: "10px"
                        }}
                    >
                        Write Data to PLC
                    </button>
                </div>

            </div>







        </div>
    )
}

