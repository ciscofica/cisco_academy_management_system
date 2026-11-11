import axios from "axios";
const instance = axios.create({
    baseURL : 'http://172.16.44.46:4000/api',
    withCredentials: true
});

export default instance;