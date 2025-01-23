import { STATUS } from "@prisma/client";

export interface BookAppointment {
  name: string;
  date: string;
  phoneNumber: string;
  status: STATUS;
}

export interface RescheduleAppointment {
  date: string;
  phoneNumber: string;
}

export interface GetAppointment {
  phoneNumber: string;
}
