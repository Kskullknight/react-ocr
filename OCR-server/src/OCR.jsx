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
        console.log(file)
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

    useEffect(() => {
        console.log(base64Image)
        console.log(aiResult)
      }, [base64Image, aiResult])

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
                            <td>{aiResult.registerNumber[0].text}</td>
                        </tr>
                        <tr>
                            <td>name</td>
                            <td>{aiResult.companyName[0].text}</td>
                        </tr>
                        <tr>
                            <td>ceo</td>
                            <td>{aiResult.repName[0].text}</td>
                        </tr>
                        <tr>
                            <td>address</td>
                            <td>{aiResult.bisAddress[0].text}</td>
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
