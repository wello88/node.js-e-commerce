import bcrypt from 'bcrypt';
const pkg = bcrypt;
export const hashPassword = ({password = '',saltRound=8})=>{
    return pkg.hashSync(password,saltRound)

}

export const comparePassword = (password='', hashPassword='') => {
    
    return pkg.compareSync(password, hashPassword);
}