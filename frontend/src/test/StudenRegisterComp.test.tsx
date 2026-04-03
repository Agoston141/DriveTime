import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import StudentRegisterComp from '../components/StudenRegisterComp'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderComponent = () =>
  render(
    <MemoryRouter>
      <StudentRegisterComp />
    </MemoryRouter>
  )

describe('StudenRegisterComp – Tanuló regisztráció', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.fetch = vi.fn()
  })

  it('megjeleníti a regisztrációs űrlapot', () => {
    renderComponent()
    expect(screen.getByPlaceholderText(/családnév/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/utónév/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /fiók létrehozása/i })).toBeInTheDocument()
  })

  it('megjeleníti a jelszó mezőket', () => {
    renderComponent()
    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    expect(passwordFields.length).toBeGreaterThanOrEqual(2)
  })

  it('megjeleníti a 17 éves checkbox-ot', () => {
    renderComponent()
    expect(screen.getByLabelText(/elmúltam 17/i)).toBeInTheDocument()
  })

  it('hibát jelenít meg ha a checkbox nincs bepipálva', async () => {
    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/családnév/i), 'Teszt')
    await userEvent.type(screen.getByPlaceholderText(/utónév/i), 'Elek')
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'teszt@test.hu')

    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    await userEvent.type(passwordFields[0], 'Jelszo123!')
    await userEvent.type(passwordFields[1], 'Jelszo123!')

    fireEvent.click(screen.getByRole('button', { name: /fiók létrehozása/i }))

    await waitFor(() => {
      // Pontosan a hibaüzenetre keresünk, nem a labelre
      expect(screen.getByText(/el kell múlnod 17/i)).toBeInTheDocument()
    })
  })

  it('megjelenik a jelszó erősség jelző gépelés közben', async () => {
    renderComponent()
    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    await userEvent.type(passwordFields[0], 'gyenge')

    await waitFor(() => {
      expect(screen.getByText(/gyenge/i)).toBeInTheDocument()
    })
  })

  it('erős jelszónál megjelenik az Erős felirat', async () => {
    renderComponent()
    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    await userEvent.type(passwordFields[0], 'Eros123!')

    await waitFor(() => {
      expect(screen.getByText(/erős/i)).toBeInTheDocument()
    })
  })

  it('hibát jelenít meg ha a két jelszó nem egyezik', async () => {
    renderComponent()
    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    await userEvent.type(passwordFields[0], 'Jelszo123!')
    await userEvent.type(passwordFields[1], 'MasikJelszo!')

    await waitFor(() => {
      expect(screen.getByText(/nem egyeznek/i)).toBeInTheDocument()
    })
  })

  it('zölden jelzi ha a két jelszó egyezik', async () => {
    renderComponent()
    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    await userEvent.type(passwordFields[0], 'Jelszo123!')
    await userEvent.type(passwordFields[1], 'Jelszo123!')

    await waitFor(() => {
      expect(screen.getByText(/egyeznek/i)).toBeInTheDocument()
    })
  })

  it('a gomb disabled ha a jelszavak nem egyeznek', async () => {
    renderComponent()
    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    await userEvent.type(passwordFields[0], 'Jelszo123!')
    await userEvent.type(passwordFields[1], 'MasikJelszo!')

    const submitButton = screen.getByRole('button', { name: /fiók létrehozása/i })
    expect(submitButton).toBeDisabled()
  })

  it('sikeres regisztráció után megjelenik a siker üzenet', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/családnév/i), 'Teszt')
    await userEvent.type(screen.getByPlaceholderText(/utónév/i), 'Elek')
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'teszt@test.hu')

    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    await userEvent.type(passwordFields[0], 'Jelszo123!')
    await userEvent.type(passwordFields[1], 'Jelszo123!')

    fireEvent.click(screen.getByLabelText(/elmúltam 17/i))
    fireEvent.click(screen.getByRole('button', { name: /fiók létrehozása/i }))

    await waitFor(() => {
      expect(screen.getByText(/sikeres regisztráció/i)).toBeInTheDocument()
    })
  })

  it('hibát jelenít meg ha az email már foglalt', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Az Email már használatba van' }),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/családnév/i), 'Teszt')
    await userEvent.type(screen.getByPlaceholderText(/utónév/i), 'Elek')
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'foglalt@test.hu')

    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    await userEvent.type(passwordFields[0], 'Jelszo123!')
    await userEvent.type(passwordFields[1], 'Jelszo123!')

    fireEvent.click(screen.getByLabelText(/elmúltam 17/i))
    fireEvent.click(screen.getByRole('button', { name: /fiók létrehozása/i }))

    await waitFor(() => {
      expect(screen.getByText(/már használatba van/i)).toBeInTheDocument()
    })
  })
})