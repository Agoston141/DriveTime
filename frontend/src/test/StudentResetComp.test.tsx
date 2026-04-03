import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import StudentResetComp from '../components/StudentResetComp'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const renderComponent = () =>
  render(
    <MemoryRouter>
      <StudentResetComp />
    </MemoryRouter>
  )

describe('StudentResetComp – Jelszó visszaállítás', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.fetch = vi.fn()
  })

  it('megjeleníti a jelszó visszaállítási űrlapot', () => {
    renderComponent()
    expect(screen.getByPlaceholderText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /jelszó visszaállítása/i })).toBeInTheDocument()
  })

  it('megjeleníti a vissza a bejelentkezéshez gombot', () => {
    renderComponent()
    expect(screen.getByRole('button', { name: /vissza a bejelentkezéshez/i })).toBeInTheDocument()
  })

  it('zölden jelzi az emailt ha az létezik az adatbázisban', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ exists: true }),
    })

    renderComponent()
    const emailInput = screen.getByPlaceholderText(/e-mail/i)
    await userEvent.type(emailInput, 'letezik@test.hu')
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText(/létező email/i)).toBeInTheDocument()
    })
  })

  it('pirosan jelzi az emailt ha az NEM létezik az adatbázisban', async () => {
    ;(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ exists: false }),
    })

    renderComponent()
    const emailInput = screen.getByPlaceholderText(/e-mail/i)
    await userEvent.type(emailInput, 'nemletezik@test.hu')
    fireEvent.blur(emailInput)

    await waitFor(() => {
      // Az input alatti kis szövegre keresünk pontosan
      expect(screen.getByText(/✗ Ez az email cím nem található!/i)).toBeInTheDocument()
    })
  })

  it('megjelenik a jelszó erősség jelző', async () => {
    renderComponent()
    const passwordFields = screen.getAllByPlaceholderText(/jelszó/i)
    await userEvent.type(passwordFields[0], 'gyenge')

    await waitFor(() => {
      expect(screen.getByText(/gyenge/i)).toBeInTheDocument()
    })
  })

  it('erős jelszónál Erős felirat jelenik meg', async () => {
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

  it('a gomb disabled ha az email nem érvényes', () => {
    renderComponent()
    const submitButton = screen.getByRole('button', { name: /jelszó visszaállítása/i })
    expect(submitButton).toBeDisabled()
  })

  it('sikeres visszaállítás után megjelenik a siker üzenet', async () => {
  // URL alapú mockolás, hogy stabilabb legyen
  window.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('/user/checkEmail/')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ exists: true }),
      });
    }
    if (url.includes('/user/reset')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ message: 'Siker' }),
      });
    }
    return Promise.reject(new Error('Ismeretlen URL'));
  });

  renderComponent();

  const emailInput = screen.getByPlaceholderText(/e-mail/i);
  const passwordInput = screen.getByPlaceholderText(/🔒︎ Új jelszó/i);
  const confirmInput = screen.getByPlaceholderText(/🔒︎ Jelszó megerősítése/i);

  // Email beírása és blur kiváltása
  await userEvent.type(emailInput, 'letezik@test.hu');
  fireEvent.blur(emailInput);

  // Megvárjuk, amíg a zöld jelzés megjelenik (ez jelzi, hogy lefutott a fetch)
  await waitFor(() => {
    expect(screen.getByText(/✓ Létező email cím/i)).toBeInTheDocument();
  });

  // Jelszavak kitöltése
  await userEvent.type(passwordInput, 'Jelszo123!');
  await userEvent.type(confirmInput, 'Jelszo123!');

  // Megvárjuk, amíg a gomb aktív lesz (a komponens logikája miatt ez fontos)
  const submitButton = screen.getByRole('button', { name: /jelszó visszaállítása/i });
  await waitFor(() => expect(submitButton).not.toBeDisabled());

  // Kattintás
  await userEvent.click(submitButton);

  // A siker üzenet ellenőrzése
  await waitFor(() => {
    expect(screen.getByText(/Sikeres visszaállítás! Átirányítás.../i)).toBeInTheDocument();
  }, { timeout: 2000 });
});

  it('vissza gomb a bejelentkezési oldalra navigál', () => {
    renderComponent()
    fireEvent.click(screen.getByRole('button', { name: /vissza a bejelentkezéshez/i }))
    expect(mockNavigate).toHaveBeenCalledWith('/student')
  })
})