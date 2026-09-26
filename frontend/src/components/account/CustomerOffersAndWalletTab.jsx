import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getCashbackWallet, getCashbackTransactions } from '../../services/cashbackService.js';
import { getActiveOffers } from '../../services/offerService.js';

export default function CustomerOffersAndWalletTab() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({ available: 0, pending: 0, totalEarned: 0, totalRedeemed: 0 });
  const [transactions, setTransactions] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!user?.uid) return;
      try {
        setLoading(true);
        const [w, txns, off] = await Promise.all([
          getCashbackWallet(user.uid),
          getCashbackTransactions(user.uid),
          getActiveOffers()
        ]);
        if (isMounted) {
          setWallet(w);
          setTransactions(txns);
          setOffers(off);
        }
      } catch (err) {
        console.warn('[CustomerOffersAndWalletTab] Error loading wallet data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-neutral-500">Loading your Atelier Wallet & Offers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Wallet Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Available Cashback</span>
            <span className="text-base">💰</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono">
            ₹{wallet.available.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Ready to redeem at checkout on any bespoke piece
          </p>
        </div>

        {/* Pending Balance */}
        <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/30 p-5 rounded-2xl border border-amber-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Cashback</span>
            <span className="text-base">⏳</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 font-mono">
            ₹{wallet.pending.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-700 font-medium">
            Unlocks automatically once your orders are delivered
          </p>
        </div>

        {/* Lifetime Earned */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lifetime Earned</span>
            <span className="text-base">✨</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-dark font-mono">
            ₹{wallet.totalEarned.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-neutral-400">
            Cumulative privilege rewards credited
          </p>
        </div>

        {/* Total Redeemed */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Redeemed</span>
            <span className="text-base">🏷️</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-dark font-mono">
            ₹{wallet.totalRedeemed.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-neutral-400">
            Savings claimed across past commissions
          </p>
        </div>
      </div>

      {/* 2. Active Store Offers & Privilege Coupons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-brand-dark">
              Active Privilege Offers & Codes
            </h3>
            <p className="text-xs text-neutral-500">
              Apply these promotions directly during checkout or shopping
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-brand-accent hover:underline"
          >
            Explore Catalog &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-black px-2.5 py-1 bg-neutral-100 rounded-lg border border-neutral-200 text-brand-dark tracking-wider">
                    {offer.code}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent">
                    {offer.badge || 'OFFER'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-brand-dark">
                  {offer.name}
                </h4>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  {offer.minimumOrderValue > 0 ? (
                    <>Min Order: <strong>₹{offer.minimumOrderValue.toLocaleString('en-IN')}</strong></>
                  ) : (
                    'No Minimum'
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(offer.code)}
                  className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition-colors"
                >
                  {copiedCode === offer.code ? '✓ Copied' : 'Copy Code'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Cashback Transaction Ledger */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-brand-dark">
            Cashback Transaction History
          </h3>
          <p className="text-xs text-neutral-500">
            Real-time ledger of reward earnings and checkout redemptions
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-neutral-200 p-6 space-y-2">
            <span className="text-3xl">🪙</span>
            <h4 className="text-sm font-bold text-brand-dark">No Cashback Transactions Yet</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Earn 5% cashback on every custom tailoring commission of ₹1,999 or more. Your rewards will automatically appear here.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-block px-4 py-2 bg-brand-dark hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Start Bespoke Commission
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Transaction / Order</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-brand-dark">{t.description}</div>
                        {t.orderId && (
                          <Link
                            to={`/orders/${t.orderId}`}
                            className="text-[11px] text-brand-accent hover:underline"
                          >
                            Order #{t.orderId}
                          </Link>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {t.type === 'credit' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Available Credit
                          </span>
                        ) : t.type === 'debit' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Redeemed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Pending Delivery
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 whitespace-nowrap">
                        {new Date(t.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-right font-black font-mono text-sm whitespace-nowrap">
                        {t.type === 'debit' ? (
                          <span className="text-rose-600">-₹{Number(t.amount).toLocaleString('en-IN')}</span>
                        ) : t.type === 'credit' ? (
                          <span className="text-emerald-600">+₹{Number(t.amount).toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-amber-600">+₹{Number(t.amount).toLocaleString('en-IN')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
