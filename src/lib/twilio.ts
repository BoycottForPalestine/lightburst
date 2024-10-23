// Twilio Credentials
// To set up environmental variables, see http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// require the Twilio module and create a REST client
const client = require("twilio")(accountSid, authToken);

export async function sendSms(to: string, body: string): Promise<string> {
  if (process.env.TWILIO_ENV === "local") {
    console.log("SMS not sent in local environment");
    console.log("SMS Data:");
    console.log("To: ", to);
    console.log("Body: ", body);
    return "NO_MESSAGE_ID_FOR_LOCAL";
  } else if (process.env.TWILIO_ENV === "local_live") {
    // Sends all texts to the twilio virtual number
    console.log(accountSid, authToken);
    const message = await client.messages.create({
      body: body,
      from: "+18447948206",
      to: "+18777804236",
    });

    console.log(message);

    return message.sid;
  } else if (process.env.TWILIO_ENV === "prod") {
    // client.messages
    //   .create({
    //     body,
    //     from,
    //     to,
    //   })
    //   .then((message: any) => console.log(message.sid))
    //   .done();
    return "NOOP";
  }
  return "NOOP";
}
