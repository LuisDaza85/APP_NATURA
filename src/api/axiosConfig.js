import axios from "axios";

const instance = axios.create({
 // baseURL: "http://10.0.2.2:3001/api", // ✅ IP especial para emulador Android
 //casa noe
  baseURL: "http://192.168.100.34:3001/api", 
  headers: {
    "Content-Type": "application/json"
  }
});

export default instance;
