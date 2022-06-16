
const config = require('config');

// req,
module.exports.momo = async ({donhang}) => {
    try {
        let redirectToMomo = '';
        //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
        //parameters
        var partnerCode = "MOMOACV320220526";
        var accessKey = "xJQVuaWH1W8TWOKm";
        var secretkey = "IEP6mMssDm0utpJElmB4MqelyypRre6b";
        var requestId = partnerCode + new Date().getTime();
        var orderId = donhang.idhoadon;
        var orderInfo = "pay with MoMo";
        // var redirectUrl = "https://momo.vn/return";
        var redirectUrl = config.get('momo_ReturnUrl');

        var ipnUrl = "https://callback.url/notify";
        // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
        var amount = donhang.thanhtien;
        var requestType = "captureWallet"
        var extraData = ""; //pass empty value if your merchant does not have stores

        //before sign HMAC SHA256 with format
        //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
        var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType
        //puts raw signature
        // console.log("--------------------RAW SIGNATURE----------------")
        // console.log(rawSignature)
        //signature
        const crypto = require('crypto');
        var signature = crypto.createHmac('sha256', secretkey)
            .update(rawSignature)
            .digest('hex');
        // console.log("--------------------SIGNATURE----------------")
        // console.log(signature)

        //json object send to MoMo endpoint
        const requestBody = JSON.stringify({
            partnerCode: partnerCode,
            accessKey: accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'en'
        });
        return await doRequest(requestBody);

    } catch (error) {
        console.log(error);
    }


}
function doRequest(requestBody ) {
    return new Promise((resolve, reject) => {
      //Create the HTTPS objects
      const https = require('https');
      const options = {
          hostname: 'test-payment.momo.vn',
          port: 443,
          path: '/v2/gateway/api/create',
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(requestBody)
          }
      }
      //Send the request and get the response
      const req = https.request(options, async res => {
          // console.log(`Status: ${res.statusCode}`);
          // console.log(`Headers: ${JSON.stringify(res.headers)}`);
          res.setEncoding('utf8');
          res.on('data', (body) => {
              // console.log('Body: ');
              // console.log(body);
              console.log('payUrl: ');
              console.log(JSON.parse(body).payUrl);
              redirectToMomo = JSON.parse(body).payUrl;

          });
          res.on('end', () => {
              console.log('No more data in response.');
             return resolve(redirectToMomo);

          });
      })


      req.on('error', (e) => {
          console.log(`problem with request: ${e.message}`);
      });
      // write data to request body
      // console.log("Sending....")
      req.write(requestBody);
      req.end();
    });
  }