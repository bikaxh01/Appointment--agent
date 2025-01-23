import { prismaClient } from "./prismaClient";

import OpenAI from "openai";
import {
  BookAppointment,
  GetAppointment,
  RescheduleAppointment,
} from "./types";

async function bookAppointment(data: BookAppointment) {

  try {
    
    const appointment = await prismaClient.appointments.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        appointmentDate: new Date(data.date),
        status: "CONFIRM",
      },
    });

    return appointment;
  } catch (error: any) {
    //console.log("🚀 ~ bookAppointment ~ error:", error);
    throw new Error(error.message);
  }
}

async function rescheduleAppointment({
  date,
  phoneNumber,
}: RescheduleAppointment) {
  const appointment = await getAppointmentByMobileNumber({ phoneNumber });

  if (!appointment) {
    return "No appointment found";
  }

  const response = await prismaClient.appointments.update({
    where: {
      phoneNumber,
    },
    data: {
      appointmentDate: new Date(date),
    },
  });
  return response;
}

async function getAppointmentByMobileNumber({ phoneNumber }: GetAppointment) {

  const appointment = await prismaClient.appointments.findUnique({
    where: {
      phoneNumber,
    },
  });

  return appointment;
}

export const Task: any = {
  bookAppointment: bookAppointment,
  getAppointmentByMobileNumber: getAppointmentByMobileNumber,
  rescheduleAppointment: rescheduleAppointment,
};

export const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",

    function: {
      name: "bookAppointment",
      description: "To Book Appointment",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of patient",
          },
          date: {
            type: "string",
            description: "Date of for booking",
          },
          phoneNumber: {
            type: "string",
            description: "Mobile Number of patient",
          },
        },
        required: ["name", "date", "phoneNumber"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getAppointmentByMobileNumber",
      description: "Get the Details of Appointment",
      parameters: {
        type: "object",
        properties: {
          phoneNumber: {
            type: "string",
            description: "Mobile Number throw which the appointment is booked ",
          },
        },
        required: ["phoneNumber"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "rescheduleAppointment",
      description: "reschedule  of booked appointment",
      parameters: {
        type: "object",
        properties: {
          phoneNumber: {
            type: "string",
            description: "Mobile Number throw which the appointment is booked ",
          },
          date: {
            type: "string",
            description: "Date for which the appointment should be booked ",
          },
        },
        required: ["phoneNumber", "date"],
        additionalProperties: false,
      },
    },
  },
];

export const systemPrompt = `

You are Appointment Booking AI Agent your task is to book, update and get appointments for user you have been provided access to some tools that will help you to book appointment 

#Rules you need to follow:
 - Make sure to parse the response from in proper format and do not add any symbols or special characters like '\n' '/' '\' in the assistant response 
 - Phone number should only contain 10 digits not more than that.


#Tools you can access
- bookAppointment 

E.g:bookAppointment : John Does, 2025-01-14 22:03:11.221, 7895266526, NOTE: convert Date to ISO 8601  DateTime format 
Tool:{  id   46564S55DADRZC
name  Bikash Mishra
phoneNumber  7896545662
appointmentDate 2025-02-20 07:40:00
status          CONFIRM
createdAt       2025-01-23 11:33:05.156
}   
assistant : well i have to you appointment , here is the detail of your appointment : Name: John Doe, Phone Number: 978000000000, Date: 24 Jun , Time: 12:30 status:"confirm"
 
- rescheduleAppointment
   E.g:rescheduleAppointment : 2025-01-14 22:03:11.221,7895266526,
- getAppointmentByMobileNumber
     E.g:getAppointmentByMobileNumber : 7895266526,

Note: These are normal Function that will help you to do book, update, get appointment data you will be only using there tools to perform actions 
#Example session

# In case of Book Appointment
 user: they i want to book appointment
 assistant: sure i will book appointment for you. can you provide me some below details like Name,Phone number, date and time.

 user : John Doe, 9780000000, 24 Jun,
 assistant : hey i think you forgotten the add time can you provide the time for which you want to book.

 user : 12:30  
 Tool: bookAppointment
 assistant: you appointment has been booked below is the detail of you appointment : Name: John Doe, Phone Number: 978000000000, Date: 24 Jun , Time: 12:30 se you at Clinic.


 #In case of get Appointment

 user : hey can you provide me detail of my appointment.
 assistant: ya sure please provide your phone number 
 
 user:9780000000000
 assistant: well i have to you appointment , here is the detail of your appointment : Name: John Doe, Phone Number: 978000000000, Date: 24 Jun , Time: 12:30 status:"confirm"
 

 #In case of reschedule Appointment date
 user: hey i want to reschedule my appointment
 assistant: sure, can you provide me your phone Number

 user: ya, 978000000000
 assistant: ok, here is the detail of your appointment : Name: John Doe, Phone Number: 978000000000, Date: 24 Jun , Time: 12:30 for which date and time you want to reschedule.

 user: 12 May 13:00
 assistant: ok , you appointment has been rescheduled. here is the updated detail of your appointment, Name: John Doe, Phone Number: 978000000000, Date: 12 May , Time: 13:00
  

 #Else case
 user: what is the capital of france.
 assistant: sorry i can't response you that i am appointment booking agent i can help you related to book appointment 

 NOTE: You hov to response as appointment agent.



`;

function formatDateToCustomString(isoDateString: string) {
  const date = new Date(isoDateString);

  const isoWithMilliseconds = date.toISOString();

  const formattedDate = isoWithMilliseconds
    .replace("T", " ") // Replace "T" with a space
    .replace(/\.\d+Z$/, ".000"); // Ensure 3 decimal places (milliseconds)

  return formattedDate;
}
