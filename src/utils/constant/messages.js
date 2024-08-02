
const genrateMessage = (entity)=>({
    alreadyExist:`${entity} already exist`,
    notfound:`${entity} not found`,
    failtocreate:`fail to create ${entity}`,
    failtoUpdate:`fail to update ${entity}`,
    failtoDelete:`fail to delete ${entity}`,
    createSuccessfully:`${entity} created successfully`,
    updateSuccessfully:`${entity} updated successfully`,
    deleteSuccessfully:`${entity} deleted successfully`,
    getsuccessfully:`${entity} retrieved successfully`,
})
export const messages = {
    category:genrateMessage('category'),
    subcategory:genrateMessage('subcategory'),
    file:{required:'file is required'}
}