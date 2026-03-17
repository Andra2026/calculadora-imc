export type PessoaFormInput = {
  nome: string
  idade: string
  altura: string
}

export type PessoaFormErrors = {
  nome?: string
  idade?: string
  altura?: string
}

export function validatePessoaForm(input: PessoaFormInput) {
  const errors: PessoaFormErrors = {}
  const nome = input.nome.trim()
  const idade = parseInt(input.idade, 10)
  const altura = parseFloat(input.altura.replace(',', '.'))

  if (!nome) errors.nome = 'Nome e obrigatorio'
  else if (nome.length < 2 || nome.length > 120) errors.nome = 'Nome deve ter entre 2 e 120 caracteres'

  if (input.idade === '' || Number.isNaN(idade)) errors.idade = 'Informe uma idade valida'
  else if (idade < 1 || idade > 150) errors.idade = 'Idade deve ser entre 1 e 150'

  if (input.altura === '' || Number.isNaN(altura)) errors.altura = 'Informe uma altura valida (ex: 1.75)'
  else if (altura < 0.5 || altura > 2.5) errors.altura = 'Altura deve ser entre 0,5 e 2,5 m'

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    parsed: { nome, idade, altura },
  }
}

export function validatePesoForm(pesoRaw: string, dataRaw?: string) {
  const peso = parseFloat(pesoRaw.replace(',', '.'))
  if (pesoRaw.trim() === '' || Number.isNaN(peso)) {
    return { valid: false, error: 'Informe o peso em kg (ex: 72.5)', parsedPeso: null as number | null }
  }
  if (peso < 20 || peso > 400) {
    return { valid: false, error: 'Peso deve ser entre 20 e 400 kg', parsedPeso: null as number | null }
  }
  if (dataRaw) {
    const date = new Date(`${dataRaw}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date > today) {
      return { valid: false, error: 'Data nao pode ser futura', parsedPeso: null as number | null }
    }
  }
  return { valid: true, error: null as string | null, parsedPeso: peso }
}
