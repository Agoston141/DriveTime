import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import StudentLogin from '../components/StudentSiteComp'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderComponent = () =>
  render(
    <MemoryRouter>
      <StudentLogin />
    </MemoryRouter>
  )

describe('StudentSiteComp – Tanuló bejelentkezés', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    window.fetch = vi.fn()
  })

  it('megjeleníti a bejelentkezési űrlapot', () => {
    renderComponent()
    expect(screen.getByPlaceholderText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/jelszó/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /bejelentkezés/i })).toBeInTheDocument()
  })

  it('megjeleníti a regisztráció gombot', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /regisztráció/i })).toBeInTheDocument()
  })

  it('megjeleníti az elfelejtett jelszó gombot', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /elfelejtett jelszó/i })).toBeInTheDocument()
  })

  it('hibát jelenít meg ha a szerver hibát küld', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Hibás email vagy jelszó' }),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'rossz@email.hu')
    await userEvent.type(screen.getByPlaceholderText(/jelszó/i), 'rosszjelszó')
    fireEvent.click(screen.getByRole('button', { name: /bejelentkezés/i }))

    await waitFor(() => {
      expect(screen.getByText(/hibás email vagy jelszó/i)).toBeInTheDocument()
    })
  })

  it('hibát jelenít meg ha a role nem STUDENT', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'token123',
        user: { role: 'ADMIN', name: 'Admin' },
      }),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'admin@test.hu')
    await userEvent.type(screen.getByPlaceholderText(/jelszó/i), 'jelszo123')
    fireEvent.click(screen.getByRole('button', { name: /bejelentkezés/i }))

    await waitFor(() => {
      expect(screen.getByText(/admin szerepkörhöz van társítva/i)).toBeInTheDocument()
    })
  })

  it('sikeres bejelentkezés után elmenti a tokent', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'token123',
        user: { role: 'STUDENT', name: 'Teszt Tanuló' },
      }),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'tanulo@test.hu')
    await userEvent.type(screen.getByPlaceholderText(/jelszó/i), 'jelszo123')
    fireEvent.click(screen.getByRole('button', { name: /bejelentkezés/i }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('token123')
    })
  })

  it('megnyitja az elfelejtett jelszó modalt', async () => {
    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /elfelejtett jelszó/i }))
    await waitFor(() => {
      expect(screen.getByText(/azonosítsa magát/i)).toBeInTheDocument()
    })
  })

  it('sikeresen elküldi a reset emailt', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    })

    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /elfelejtett jelszó/i }))
    await waitFor(() => screen.getByText(/azonosítsa magát/i))

    const emailInputs = screen.getAllByPlaceholderText(/e-mail/i)
    await userEvent.type(emailInputs[emailInputs.length - 1], 'tanulo@test.hu')
    fireEvent.click(screen.getByRole('button', { name: /küldés/i }))

    await waitFor(() => {
      expect(screen.getByText(/sikeres azonosítás/i)).toBeInTheDocument()
    })
  })

  it('hibát jelenít meg ha az email nem létezik a reset során', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    })

    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /elfelejtett jelszó/i }))
    await waitFor(() => screen.getByText(/azonosítsa magát/i))

    const emailInputs = screen.getAllByPlaceholderText(/e-mail/i)
    await userEvent.type(emailInputs[emailInputs.length - 1], 'nemletezik@test.hu')
    fireEvent.click(screen.getByRole('button', { name: /küldés/i }))

    await waitFor(() => {
      expect(screen.getByText(/nem létezik/i)).toBeInTheDocument()
    })
  })
})