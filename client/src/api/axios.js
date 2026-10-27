import axios from "axios";
const instance = axios.create({
    baseURL: 'http://localhost:4000/api',
    // baseURL : 'http://172.16.44.190:4000/api',
    //baseURL: "http://172.20.136.164:4000/api",
    //baseURL: "http://192.168.2.11:4000/api",
    withCredentials: true
});

export default instance;