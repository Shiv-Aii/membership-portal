export type ApplicationStatus = "pending" | "approved" | "rejected";

export type Application = {
  id: string;
  name: string;
  designation: string;
  village: string;
  taluk: string;
  district: string;
  mobile: string;
  aadhaar: string;
  photo_url: string | null;
  status: ApplicationStatus;
  membership_no: string | null;
  created_at: string;
};