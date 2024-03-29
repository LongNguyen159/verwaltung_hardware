export interface DeviceInput {
    deviceName: string
    deviceLocation: string
}

export interface DeviceMetaData {
  id: number
  item_name: string
  description?: string
  annotation?: string
  location: string
  user_id?: number
  user_name?: string
  user_type?: string
  user_email?: string
}

export interface QrData {
  id: number
  deviceName: string
}

export interface DeviceMetaData1 {
  id: number,
  product_type: {
    id: number,
    name: string,
    description?: string
  },
  current_room: {
    id: number,
    room_number: string
  },
  annotation?: string
  borrowed_by_user?: {
    id: number | null,
    first_name: string,
    last_name: string,
    email: string,
    user_type: {
      id: number,
      name: string,
    },
    password_hash: string
  },
  qr_code?: string
}