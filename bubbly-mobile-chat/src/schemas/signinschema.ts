import * as Yup from 'yup'

export const signinSchmea = Yup.object({
    email: Yup.string()
    .email("* Please enter a valid email")
    .required("* Please enter the email"),
    password:Yup.string().required("* Please enter the password")
})