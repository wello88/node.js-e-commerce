import bcrypt from 'bcrypt';
const pkg = bcrypt;
export const hashPassword = ({password = '',saltRound=8})=>{
    // console.log(typeof(password))
    return pkg.hashSync(password,saltRound)

}

export const comparePassword = (password='', hashPassword='') => {
    console.log('Retrieved hashPassword:', hashPassword);
    console.log('Type of hashPassword:', typeof(hashPassword));
    console.log('Type of password:', typeof(password));
    
    // Check if hashPassword is indeed an object
    if (typeof hashPassword === 'object') {
        console.error('Error: hashPassword should be a string but is an object');
        return false;
    }
    
    return pkg.compareSync(password, hashPassword);
}