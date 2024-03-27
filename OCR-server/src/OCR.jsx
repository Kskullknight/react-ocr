import { useState, useEffect} from 'react'
import './OCR.css'

const apiUrl = '/api/biz-license';
const ocr_secret = "eFhHUHZnWU9hQWRNZ21ZdFhvU2FtZFFSRWp1bXhiZnU=";
const version = "V2"

const getBase64 = function (file, cb) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (){
        cb(reader.result)
    };
    reader.onerror = function (error){
        console.log(error)
    }
}

function OCR(){
    const [uploadedImage, setUploadedImage] = useState(null);
    const [base64Image, setBase64Image] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    

    const onChangeImage = async (e) => {
        const file = e.target.files[0];
        const imageUrl = URL.createObjectURL(file)
        setUploadedImage(imageUrl);

        try{
            getBase64(file, (result) => {
                setBase64Image(result.split(';'))
            })
        }
        catch{
            console.log("image to base64 error")
        }
    };

    // useEffect(() => {
    //     console.log(base64Image)
    //     console.log(aiResult)
    //   }, [base64Image, aiResult])

    const callOcrApi = async () => {
        if (base64Image == null){
            return
        }

        console.log(base64Image[0].split('/')[1])
        console.log(base64Image[1].split(',')[1])
        try {
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-OCR-SECRET': ocr_secret
                },
                body: JSON.stringify({
                    'version': version,
                    'requestId': "string",
                    'timestamp': 0,
                    'images':[
                        {
                            'format': base64Image[0].split('/')[1],
                            'data': base64Image[1].split(',')[1],
                            'name': "test"
                        }
                    ]
                })
            })
            .then((res) => res.json())
            .then((data) => {

                console.log(data)
                setAiResult(data.images[0].bizLicense.result)
            })
        } 
        catch (error) {
            console.log("error")
        }
    }

    function printPairArrary(itemArr, typeArr){
        let newArr = [];
        let typeIdx = 0;
        let itemIdx = 0;
        let type;
        let item;

        while(typeIdx < typeArr.length){
            type = typeArr[typeIdx++].text;
            item = itemArr[itemIdx].text;

            if(itemIdx < itemArr.length){
                while(itemIdx + 1 < itemArr.length && (itemArr[itemIdx + 1].boundingPolys[0].vertices[0].y - itemArr[itemIdx].boundingPolys[0].vertices[0].y <
                    itemArr[itemIdx + 1].boundingPolys[0].vertices[0].x - itemArr[itemIdx].boundingPolys[0].vertices[0].x)){
                        item += ", " + itemArr[++itemIdx].text
                    }
                itemIdx++;
                newArr.push([type, item])
                continue
            }
            break
        }

        return newArr
    }
    
    return(
        <div>
            <input type="file" onChange={onChangeImage}/>
            <div>
            {uploadedImage ? 
                <div>
                    <img src={uploadedImage} />
                </div>
                :
                <div>사진 없음</div>                
            }
            </div>
            <input type="submit" onClick={callOcrApi}/>
            {aiResult?
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>numper</td>
                            <td>{ "registerNumber" in aiResult ? aiResult.registerNumber[0].text : "찻지못함" }</td>
                        </tr>
                        <tr>
                            <td>name</td>
                            <td>{"companyName" in aiResult ? aiResult.companyName[0].text : "corpName" in aiResult ? aiResult.corpName[0].text : "찻지못함"}</td>
                        </tr>
                        <tr>
                            <td>ceo</td>
                            <td>{"repName" in aiResult ? aiResult.repName[0].text : "찻지못함"}</td>
                        </tr>
                        <tr>
                            <td>address</td>
                            <td>{"bisAddress" in aiResult? aiResult.bisAddress[0].text : "찻지못함"}</td>
                        </tr>
                        <tr>
                            <td>업종</td>
                            {
                                "bisItem" in aiResult && "bisType" in aiResult ?
                                <div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>업태</th>
                                                <th>종목</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                printPairArrary(aiResult.bisItem, aiResult.bisType).map((element, idx) => {
                                                    return(
                                                        <tr key={idx}>
                                                            <td>{element[0]}</td>
                                                            <td>{element[1]}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                                
                                :
                                <td>찻지못함</td>
                            }
                        </tr>
                    </tbody>
                </table>
            </div>
            :
            <dir>결과 없음</dir>
            }
        </div>

        
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export default OCR
