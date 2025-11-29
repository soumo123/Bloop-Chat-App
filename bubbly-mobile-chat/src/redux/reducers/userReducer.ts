import {USER_DETAILS_PENDING,USER_DETAILS_SUCCESS,USER_DETAILS_FAIL} from '../constants/userConstant.ts'

const initialState = {
    user:{},
    error:null,
}


export const userReducer = (state=initialState,action)=>{
    switch (action.type) {
        case USER_DETAILS_PENDING:
            return {
                ...state,
                error:null
            }
        case USER_DETAILS_SUCCESS:
            return{
                ...state,
                user:action.payload,
                error:false
            }
        case USER_DETAILS_FAIL:
            return{
                ...state,
                error:true
            }
        default:
            return state;
    }
}