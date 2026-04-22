'use client'

import { useState } from 'react'

const statesCities: Record<string, string[]> = {
  'GO': [
    'Valparaíso de Goiás',
    'Luziânia',
    'Cidade Ocidental',
    'Santo Antônio do Descoberto',
    'Águas Lindas de Goiás',
    'Planaltina de Goiás',
    'Novo Gama',
  ],
  'DF': [
    'Brasília',
  ],
}

const stateLabels: Record<string, string> = {
  'GO': 'Goiás',
  'DF': 'Distrito Federal',
}

const inputClass = 'bg-transparent border-b border-zinc-700 py-2 focus:outline-none focus:border-[#FF4500] transition-colors text-zinc-100 appearance-none'
const labelClass = 'text-[10px] uppercase tracking-wider text-zinc-500'

export function AddressFields() {
  const [selectedState, setSelectedState] = useState('')
  const cities = selectedState ? statesCities[selectedState] || [] : []

  return (
    <>
      <div className="flex flex-col space-y-2 md:col-span-2">
        <label className={labelClass}>Logradouro / Rua</label>
        <input name="address_street" className={inputClass} />
      </div>
      <div className="flex flex-col space-y-2">
        <label className={labelClass}>Número</label>
        <input name="address_number" className={inputClass} />
      </div>
      <div className="flex flex-col space-y-2">
        <label className={labelClass}>Complemento</label>
        <input name="address_complement" className={inputClass} />
      </div>
      <div className="flex flex-col space-y-2">
        <label className={labelClass}>Bairro</label>
        <input name="neighborhood" className={inputClass} />
      </div>
      <div className="flex flex-col space-y-2">
        <label className={labelClass}>Estado / UF *</label>
        <select
          name="state"
          required
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className={inputClass}
        >
          <option value="" className="bg-[#0A0A0B] text-zinc-500">Selecione o estado...</option>
          {Object.keys(statesCities).map(uf => (
            <option key={uf} value={uf} className="bg-[#0A0A0B]">
              {stateLabels[uf]} ({uf})
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col space-y-2">
        <label className={labelClass}>Cidade *</label>
        <select
          name="city"
          required
          disabled={!selectedState}
          className={`${inputClass} ${!selectedState ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <option value="" className="bg-[#0A0A0B] text-zinc-500">
            {selectedState ? 'Selecione a cidade...' : 'Selecione o estado primeiro'}
          </option>
          {cities.map(city => (
            <option key={city} value={city} className="bg-[#0A0A0B]">{city}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col space-y-2">
        <label className={labelClass}>CEP</label>
        <input name="zipcode" className={inputClass} />
      </div>
    </>
  )
}
