import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminSiteComp from '../components/AdminSiteComp'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderComponent = () =>
  render(
    <MemoryRouter>
      <AdminSiteComp />
    </MemoryRouter>
  )

describe('AdminSiteComp – Admin bejelentkezés', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    window.fetch = vi.fn()
  })

  it('megjeleníti az admin bejelentkezési űrlapot', () => {
    renderComponent()
    expect(screen.getByPlaceholderText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/jelszó/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /belépés/i })).toBeInTheDocument()
  })

  it('megjeleníti a fejléc szövegét', () => {
    renderComponent()
    expect(screen.getByText(/admin felületre/i)).toBeInTheDocument()
  })

  it('hibát jelenít meg ha a szerver hibát küld', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Hibás email vagy jelszó' }),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'rossz@email.hu')
    await userEvent.type(screen.getByPlaceholderText(/jelszó/i), 'rosszjelszó')
    fireEvent.click(screen.getByRole('button', { name: /belépés/i }))

    await waitFor(() => {
      expect(screen.getByText(/hibás email vagy jelszó/i)).toBeInTheDocument()
    })
  })

  it('hibát jelenít meg ha a role nem ADMIN', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: /belépés/i }))

    await waitFor(() => {
      expect(screen.getByText(/student szerepkörhöz van társítva/i)).toBeInTheDocument()
    })
  })

  it('hibát jelenít meg ha a szerver nem küld szerepkört', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'token123',
        user: { name: 'Teszt' },
      }),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'admin@test.hu')
    await userEvent.type(screen.getByPlaceholderText(/jelszó/i), 'jelszo123')
    fireEvent.click(screen.getByRole('button', { name: /belépés/i }))

    await waitFor(() => {
      expect(screen.getByText(/nem küldött szerepkört/i)).toBeInTheDocument()
    })
  })

  it('sikeres bejelentkezés után elmenti a tokent', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'admintoken123',
        user: { role: 'ADMIN', name: 'Fő Admin' },
      }),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'admin@drivetime.hu')
    await userEvent.type(screen.getByPlaceholderText(/jelszó/i), 'admin123')
    fireEvent.click(screen.getByRole('button', { name: /belépés/i }))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('admintoken123')
      expect(localStorage.getItem('role')).toBe('ADMIN')
    })
  })

  it('sikeres bejelentkezés után megjelenik a figyelmeztető modal', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'admintoken123',
        user: { role: 'ADMIN', name: 'Fő Admin' },
      }),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'admin@drivetime.hu')
    await userEvent.type(screen.getByPlaceholderText(/jelszó/i), 'admin123')
    fireEvent.click(screen.getByRole('button', { name: /belépés/i }))

    await waitFor(() => {
      // A szöveg több elemre van törve, ezért funkciót használunk
      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' &&
          element.textContent?.includes('ne felejtsen el') === true &&
          element.textContent?.includes('kijelentkezni') === true
      })).toBeInTheDocument()
    })
  })

  it('a FOLYTATÁS gomb az admin-site oldalra navigál', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'admintoken123',
        user: { role: 'ADMIN', name: 'Fő Admin' },
      }),
    })

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'admin@drivetime.hu')
    await userEvent.type(screen.getByPlaceholderText(/jelszó/i), 'admin123')
    fireEvent.click(screen.getByRole('button', { name: /belépés/i }))

    await waitFor(() => screen.getByRole('button', { name: /folytatás/i }))
    fireEvent.click(screen.getByRole('button', { name: /folytatás/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/admin-site')
  })

  it('a gomb disabled bejelentkezés közben', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => new Promise(() => {})
    )

    renderComponent()
    await userEvent.type(screen.getByPlaceholderText(/e-mail/i), 'admin@test.hu')
    await userEvent.type(screen.getByPlaceholderText(/jelszó/i), 'jelszo123')
    fireEvent.click(screen.getByRole('button', { name: /belépés/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /folyamatban/i })).toBeDisabled()
    })
  })
})