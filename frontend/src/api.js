import axios from 'axios'


export const saveWorkflow = async (payload) => {
const { data } = await axios.post('/api/workflows', payload)
return data
}


export const loadWorkflow = async (id) => {
const { data } = await axios.get(`/api/workflows/${id}`)
return data
}


export const listWorkflows = async () => {
const { data } = await axios.get('/api/workflows')
return data
}