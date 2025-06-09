import React from 'react'
import EditSpeciesForm from '../../components/species/EditSpeciesForm'

const EditSpeciesPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 my-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-600">Edit Species</h1>
        <p className="text-gray-600">
          Fill out the form below to edit the species
        </p>
      </header>
      <div className="w-full max-w-2xl bg-white shadow-[0px_0px_30px_-16px_rgba(0,_0,_0,_0.8)] rounded-lg p-6 mb-10">
        <EditSpeciesForm/>
      </div>
    </div>
  )
}

export default EditSpeciesPage