import {USER_DETAILS_PENDING,USER_DETAILS_SUCCESS,USER_DETAILS_FAIL} from '../constants/userConstant.ts'



export const getUserPending = ()=>{
    return {
        type:USER_DETAILS_PENDING,
        payload:[]
    } 
}
export const getUserSuccess = (data)=>{
     return {
        type:USER_DETAILS_SUCCESS,
        payload:data
    } 
}
export const getUserFail = (error)=>{
     return {
        type:USER_DETAILS_FAIL,
        payload:error
    } 
}