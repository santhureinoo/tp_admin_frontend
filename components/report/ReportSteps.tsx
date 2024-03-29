import React from "react";
import { ButtonProps, FileInfo } from "../../common/types";
import ReportStep from "../ReportStep";
import ReportStepEdit from "../ReportStepEdit";
import TableOptionField from "../TableOptionField";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import rfdc from 'rfdc'
import moment from "moment";
const ReportSteps = (): React.ReactElement => {

    const [openReportStepEdit, setOpenReportStepEdit] = React.useState(false);
    const [uploadedFile, setUploadedFile] = React.useState<(File | undefined)[]>([undefined, undefined, undefined]);
    const [uploadedFileAttribute, setUploadedFileAttribute] = React.useState<(FileInfo | undefined)[]>([undefined, undefined, undefined]);
    const [selectedFileAttribute, setSelectedFileAttribute] = React.useState<FileInfo>();
    const [alreadyUploaded, setAlreadyUploaded] = React.useState<boolean[]>([false, false, false]);
    const [uploadingNow, setUploadingNow] = React.useState<boolean[]>([false, false, false]);
    const [allActionDone, setAllActionDone] = React.useState<boolean[]>([false, false, false]);
    const [date, setDate] = React.useState("");
    const [verifyStep1, setVerifyStep1] = React.useState(false);
    const [verifyStep2, setVerifyStep2] = React.useState(false);
    const [verifyStep3, setVerifyStep3] = React.useState(false);
    const [inputType, setInputType] = React.useState("Partial");

    const cloneDeep = rfdc();

    const getDownloadPresigned = async (name: string, index: number) => {
        const data = index === 1 ? { "filename": name } : { "filename": name, "outlet_id": 3, "outlet_date": "01/10/2022" }
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_SITE_URL}:4001/process_new_step_${index}`,
            data
        );
        if (index === 1) {
            return response.data.downloadUrl;
        } else if (index == 2) {
            return response.data.response;
        } else {
            return response.data.download_url;
        }
    }

    const uploadToS3 = React.useCallback((index: any) => {
        const currentUploadedFile = uploadedFile[index];
        if (currentUploadedFile) {
            axios.post(
                "https://20ix7znzn5.execute-api.ap-southeast-1.amazonaws.com/staging/getUploadUrl",
                { "name": currentUploadedFile.name, "mimeType": currentUploadedFile.type }
            ).then(response => {
                // uploadURL and filename
                const result = response.data.result;
                axios.put(result.body.uploadURL, currentUploadedFile, {
                    headers: {
                        'Content-Type': currentUploadedFile.type
                    }
                }).then(result => {

                    const clonedUploadedFileAttr = cloneDeep(uploadedFileAttribute);
                    const clonedUploadedFile = cloneDeep(uploadedFile);
                    const clonedAlreadyUploaded = cloneDeep(alreadyUploaded);

                    const clonedUploadingNow = cloneDeep(uploadingNow);
                    clonedUploadingNow[index] = true;
                    setUploadingNow(clonedUploadingNow);
                    getDownloadPresigned(currentUploadedFile.name, index).then(presignedUrl => {
                        clonedUploadingNow[index] = false;
                        clonedUploadedFileAttr[index] = {
                            name: currentUploadedFile.name,
                            type: currentUploadedFile.type,
                            downloadURL: presignedUrl
                        };

                        clonedUploadedFile[index] = undefined;
                        clonedAlreadyUploaded[index] = true;

                        setUploadedFileAttribute(clonedUploadedFileAttr);
                        setUploadedFile(clonedUploadedFile);
                        setAlreadyUploaded(clonedAlreadyUploaded);
                        setUploadingNow(clonedUploadingNow);

                    })


                }).catch(error => {
                    console.log(error);
                })
            })
            // })
        }

    }, [uploadedFile])

    const downloadFromS3 = React.useCallback((index: any) => {
        const currentUploadedFileAttribute = uploadedFileAttribute[index];
        if (currentUploadedFileAttribute) {
            const downloadURL = currentUploadedFileAttribute.downloadURL ? currentUploadedFileAttribute.downloadURL : "https://20ix7znzn5.execute-api.ap-southeast-1.amazonaws.com/staging/getDownloadPresignedUrl";
            axios.get(
                downloadURL, {
                responseType: 'blob',
            }
            ).then(response => {
                // uploadURL and filename
                // const result = response.data;
                // create file link in browser's memory
                var binaryData = [];
                binaryData.push(response.data);
                const href = URL.createObjectURL(new Blob(binaryData, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));

                // create "a" HTML element with href to file & click
                const link = document.createElement('a');
                link.href = href;
                link.setAttribute('download', `Step-${index}-result`); //or any other extension
                document.body.appendChild(link);
                link.click();

                // clean up "a" element & remove ObjectURL
                document.body.removeChild(link);
                URL.revokeObjectURL(href);

                const clonedAllActionDone = cloneDeep(allActionDone);
                clonedAllActionDone[index] = true;
                setAllActionDone(clonedAllActionDone);

                // axios.get(result.uploadURL, {
                //     responseType: 'blob',
                // }).then(result => {
                //     // create file link in browser's memory
                //     var binaryData = [];
                //     binaryData.push(response.data);
                //     const href = URL.createObjectURL(new Blob(binaryData, { type: currentUploadedFileAttribute.type }));

                //     // create "a" HTML element with href to file & click
                //     const link = document.createElement('a');
                //     link.href = href;
                //     link.setAttribute('download', currentUploadedFileAttribute.name); //or any other extension
                //     document.body.appendChild(link);
                //     link.click();

                //     // clean up "a" element & remove ObjectURL
                //     document.body.removeChild(link);
                //     URL.revokeObjectURL(href);

                // }).catch(error => {
                //     console.log(error);
                // })
            })
            // uploadFiles.forEach(uploadFile => {

            // })
        }

    }, [uploadedFileAttribute])

    const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
        if (e.currentTarget.files) {
            const currentUploadedFile = e.currentTarget.files[0];
            const clonedUploadedFile = cloneDeep(uploadedFile);
            if (index === 3 && currentUploadedFile.type === 'text/csv') {
                const reader = new FileReader();
                reader.onload = function () {
                    const text = reader.result as string;
                    var rows = text.split('\n');
                    if (rows.length > 0) {
                        setDate(moment(rows[1].split(',')[1], 'DD/MM/YYYY').format("MMMM YYYY"));
                    }
                };
                // start reading the file. When it is done, calls the onload event defined above.
                reader.readAsBinaryString(currentUploadedFile);
            }
            clonedUploadedFile[index] = currentUploadedFile;

            setUploadedFile(clonedUploadedFile);
        }
    };

    const btnList = React.useCallback((index: number): ButtonProps[] => {

        const onBtnUpload = (index: number) => {
            // setOpenReportStepEdit(true);
            uploadToS3(index);
        }

        const onBtnDownload = (index: number) => {
            if (index === 3) {
                setSelectedFileAttribute(uploadedFileAttribute[index]);
                setOpenReportStepEdit(true);

                const clonedAllActionDone = cloneDeep(allActionDone);
                clonedAllActionDone[index] = true;
                setAllActionDone(clonedAllActionDone);
            } else {
                downloadFromS3(index);
            }

        }

        return [
            {
                text: "Upload",
                onClick: () => { onBtnUpload(index) },
                disable: !uploadedFile[index] ? true : false,
                css: ` text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`,
            },
            {
                text: index !== 3 ? "Download" : "Build Report & Invoice",
                onClick: () => { onBtnDownload(index) },
                disable: !alreadyUploaded[index] ? true : false,
                css: `${index !== 3 ? '' : 'text-xs w-64'} text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`,
            }
        ]
    }, [uploadedFile, alreadyUploaded])

    const nonBtnList = (index: number) => [
        <label key={'frag label'} className="flex justify-center cursor-pointer rounded-full text-white w-40 h-10 bg-custom-darkblue hover:bg-custom-darkblue focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 dark:bg-custom-darkblue dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <span>Select Files</span>
            <input type='file' accept="*" onChange={(event) => handleUploadFile(event, index)} className="hidden" />
        </label>
    ]

    return <React.Fragment>
        <div className="drop-shadow-lg h-100 rounded-lg p-4 bg-white">
            <div className='flex flex-col gap-y-4'>
                <h3 className="text-gray-700 text-3xl"><b>Update |</b> Log</h3>
                {/* <div className="flex flex-row w-full justify-between">
                    <TableOptionField key={uuidv4()} label={'Select Input Type'} selectedValue={inputType} data={["Partial", "All"]} onChange={(selectedValue: string) => { setInputType(selectedValue) }} />
                    <div className="flex flex-row gap-x-2">
                        <TableOptionField key={uuidv4()} label={'Month'} selectedValue={inputType} data={["Partial", "All"]} onChange={(selectedValue: string) => { setInputType(selectedValue) }} />
                        <TableOptionField key={uuidv4()} label={'Year'} selectedValue={inputType} data={["Partial", "All"]} onChange={(selectedValue: string) => { setInputType(selectedValue) }} />
                    </div>
                </div> */}

                <div className="flex flex-col gap-y-14">
                    <ReportStep allActionDone={allActionDone[1]} isUploading={uploadingNow[1]} disabled={false} onVerify={verifyStep1} setOnVerify={setVerifyStep1} subTitle={"Upload Input-Sheet"} texts={["Upload the latest Input-Sheet to", "generate the savings data and the output-sheet.csv"]} buttons={btnList(1)} nonButtons={nonBtnList(1)} ></ReportStep>
                    {/* <ReportStep allActionDone={allActionDone[2]} isUploading={uploadingNow[2]} disabled={verifyStep1 ? false : true} onVerify={verifyStep2} setOnVerify={setVerifyStep2} titleChar={"2"} subTitle={"Generate Output-Sheet"} texts={["Upload the input-sheet.csv", "to download output-sheet.csv"]} buttons={btnList(2)} nonButtons={nonBtnList(2)}></ReportStep>
                    <ReportStep allActionDone={allActionDone[3]} isUploading={uploadingNow[3]} disabled={verifyStep2 ? false : true} onVerify={verifyStep3} setOnVerify={setVerifyStep3} titleChar={"3"} subTitle={"Generate Report & Invoice"} texts={["Upload the output-sheet.csv", "to generate Report & Invoice"]} buttons={btnList(3)} nonButtons={nonBtnList(3)}></ReportStep> */}
                </div>
            </div>
        </div>
        <ReportStepEdit onConfirm={() => {
            axios.get(
                `${process.env.NEXT_PUBLIC_SITE_URL}:4001/create_group_passwords`,
            );
            downloadFromS3(3);
        }} openReportStepEdit={openReportStepEdit} setOpenReportStepEdit={setOpenReportStepEdit} fromExtension={"Report & Invoice"} toExtension={"Output-Sheet.csv"} datePeriod={date} affectedRows={50} uploadedFileAttribute={selectedFileAttribute} />
    </React.Fragment>;
}

export default ReportSteps;