import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        default:""
    },
    about:{
        type:String,
        default:""
    },
    password:{
        type:String,
        require:true
    },
    connections:{
        type:Array,
        default:[]
    },
    profile:{
        type:Object,
        default:""
    },
    created_at: {
        type: Date,
        default: () => {
            return Date.now();
        },
        immutable: true
    },
    updated_at: {
        type: Date,
        default: () => {
            return Date.now();
        }
    }
})


export default mongoose.model('users', userSchema);