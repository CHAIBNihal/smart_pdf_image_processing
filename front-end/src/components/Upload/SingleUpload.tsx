import React from 'react'
import Layout from '../Layout/Layout'
import { useNavigate, useParams } from 'react-router-dom'

const SingleUpload = () => {
    const navigation = useNavigate()
    const {id} = useParams()
  return (
    <Layout title="Informations de téléchargement">
        <button  onClick={()=>navigation(`/uploadFile/${id}`)} className=''>Télécharger un document</button>
    </Layout>
  )
}

export default SingleUpload
