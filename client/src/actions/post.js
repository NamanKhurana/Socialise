import axios from 'axios'
import {setAlert} from './alert'

import {GET_POSTS,POST_ERROR,UPDATE_LIKES, DELETE_POST,ADD_POST,GET_POST,ADD_COMMENT,REMOVE_COMMENT} from './types'

//GET POSTS
export const getPosts = () => {
    return async (dispatch) => {
        try {
            const res = await axios.get('/api/posts')

            dispatch({
                type: GET_POSTS,
                payload:res.data
            })

        } catch (err) {
            dispatch({
                type:POST_ERROR,
                payload:{msg:err.response.statusText,status:err.response.status}
            })
        }
    }
}

//ADD LIKE
export const addLike = (postId) => {
    return async (dispatch) => {
        try {
            const res = await axios.put(`/api/posts/like/${postId}`)

            dispatch({
                type: UPDATE_LIKES,
                payload:{postId,likes:res.data}
            })

        } catch (err) {
            dispatch({
                type:POST_ERROR,
                payload:{msg:err.response.statusText,status:err.response.status}
            })
        }
    }
}

//REMOVE LIKE
export const removeLike = (postId) => {
    return async (dispatch) => {
        try {
            const res = await axios.put(`/api/posts/unlike/${postId}`)

            dispatch({
                type: UPDATE_LIKES,
                payload:{postId,likes:res.data}
            })

        } catch (err) {
            dispatch({
                type:POST_ERROR,
                payload:{msg:err.response.statusText,status:err.response.status}
            })
        }
    }
}

//DELETE POST
export const deletePost = (postId) => {
    return async (dispatch) => {
        try {
            await axios.delete(`/api/posts/${postId}`)

            dispatch({
                type: DELETE_POST,
                payload:postId
            })

            dispatch(setAlert('Post Removed', 'success'))

        } catch (err) {
            dispatch({
                type:POST_ERROR,
                payload:{msg:err.response.statusText,status:err.response.status}
            })
        }
    }
}

//ADD POST
export const addPost = (formData) => {

    const config = {
        headers:{
            'Content-Type':'application/json'
        }
    }

    return async (dispatch) => {
        try {
            const res = await axios.post('/api/posts',formData,config)

            dispatch({
                type: ADD_POST,
                payload:res.data
            })

            dispatch(setAlert('Post ADDED', 'success'))

        } catch (err) {
            dispatch({
                type:POST_ERROR,
                payload:{msg:err.response.statusText,status:err.response.status}
            })
        }
    }
}

//GET POST
export const getPost = (id) => {
    return async (dispatch) => {
        try {
            const res = await axios.get(`/api/posts/${id}`)

            dispatch({
                type: GET_POST,
                payload:res.data
            })

        } catch (err) {
            dispatch({
                type:POST_ERROR,
                payload:{msg:err.response.statusText,status:err.response.status}
            })
        }
    }
}

//ADD COMMENT
export const addComment = (postId,formData) => {

    const config = {
        headers:{
            'Content-Type':'application/json'
        }
    }

    return async (dispatch) => {
        try {
            const res = await axios.post(`/api/posts/comment/${postId}`,formData,config)

            dispatch({
                type: ADD_COMMENT,
                payload:res.data
            })

            dispatch(setAlert('COMMENT ADDED', 'success'))

        } catch (err) {
            dispatch({
                type:POST_ERROR,
                payload:{msg:err.response.statusText,status:err.response.status}
            })
        }
    }
}


//DELETE COMMENT
export const deleteComment = (postId,commentId) => {

    return async (dispatch) => {
        try {
            await axios.delete(`/api/posts/comment/${postId}/${commentId}`)

            dispatch({
                type: REMOVE_COMMENT,
                payload:commentId
            })

            dispatch(setAlert('COMMENT REMOVED', 'success'))

        } catch (err) {
            dispatch({
                type:POST_ERROR,
                payload:{msg:err.response.statusText,status:err.response.status}
            })
        }
    }
}
