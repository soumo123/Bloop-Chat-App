import {createStore,applyMiddleware,combineReducers} from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import {thunk} from 'redux-thunk'
import { userReducer } from './redux/reducers/userReducer'


const reducer = combineReducers({
    userReducer:userReducer
})
export type RootState = ReturnType<typeof reducer>;
const middleware = [thunk]

const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(...middleware))
)

export default store;