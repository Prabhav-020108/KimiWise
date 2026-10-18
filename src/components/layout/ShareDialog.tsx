import React, { useState, useEffect } from 'react';
import { X, Copy, CheckCircle2, Share2, Globe, Wifi, QrCode, Smartphone, Users, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '../../utils/toast';
import { useStore } from '../../store';
import { collabService } from '../../services/collabService';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

interface NetworkInfo {
  primaryIp: string;
  addresses: string[];
  port: number;
  primaryUrl: string;
  hostname: string;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, roomId }) => {
  const { collab } = useStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'qr' | 'link'>('qr');
  const [customPinInput, setCustomPinInput] = useState(roomId);

  useEffect(() => {
    setCustomPinInput(roomId);
  }, [roomId]);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch LAN IP so students and teachers on the same Wi-Fi can connect
    fetch('/api/network-info')
      .then((res) => res.json())
      .then((data: NetworkInfo) => setNetworkInfo(data))
      .catch(() => setNetworkInfo(null));
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Construct best share URL: prefer local network IP over localhost for phones/tablets
  const baseUrl =
    networkInfo?.primaryUrl && networkInfo.primaryIp !== 'localhost'
      ? networkInfo.primaryUrl
      : window.location.origin;

  const shareUrl = `${baseUrl}/?room=${roomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast.success('Classroom link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedPin(true);
    toast.success(`Room PIN "${roomId}" copied!`);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KimiWise Digital Classroom',
          text: `Join my live interactive whiteboard session with room PIN: ${roomId}`,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-[101] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/90 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25">
              <Share2 size={19} strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Share Classroom Whiteboard
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Live synchronization to student screens & tablets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-1">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <QrCode size={15} />
              <span>QR Code (Mobile)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Globe size={15} />
              <span>Link & Room PIN</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'qr' ? (
            /* ── QR Code Tab ── */
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-md">
                <QRCodeSVG
                  value={shareUrl}
                  size={170}
                  level="M"
                  includeMargin={true}
                  className="rounded-xl"
                />
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5">
                  <Smartphone size={14} className="text-blue-600" />
                  Scan with camera to view live board
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Students can open the link in any modern browser with zero installation.
                </p>
              </div>
            </div>
          ) : (
            /* ── Link & PIN Tab ── */
            <div className="space-y-4">
              {/* Room PIN Box */}
              <div className="flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                    Room PIN Code
                  </span>
                  <div className="text-xl font-black text-blue-900 tracking-wider font-mono">
                    {roomId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  {copiedPin ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  <span>{copiedPin ? 'Copied' : 'Copy PIN'}</span>
                </button>
              </div>

              {/* Direct Shareable Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Direct Classroom URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 truncate focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer"
                  >
                    {copiedLink ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Switch Room PIN */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customPinInput.trim()) {
                    collabService.joinRoom(customPinInput.trim());
                    toast.success(`Switched to classroom room "${customPinInput.trim()}"`);
                  }
                }}
                className="space-y-1.5 pt-1 border-t border-slate-100"
              >
                <label className="text-[11px] font-bold text-slate-600">
                  Switch to Another Room PIN:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customPinInput}
                    onChange={(e) => setCustomPinInput(e.target.value.toUpperCase())}
                    placeholder="Enter Custom Room PIN..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800 uppercase focus:border-blue-500 focus:outline-none"
                    maxLength={16}
                  />
                  <button
                    type="submit"
                    disabled={customPinInput.trim() === roomId || !customPinInput.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <span>Switch</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Participants in Room */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-blue-600" />
                Active in Room ({collab.connectedPeers})
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Sync Active
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {collab.peers && collab.peers.length > 0 ? (
                collab.peers.map((peer) => (
                  <span
                    key={peer.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: peer.color || '#2563eb' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{peer.name}</span>
                    {peer.isHost && (
                      <span className="text-[9px] bg-black/20 px-1 py-0.2 rounded font-black uppercase">
                        Host
                      </span>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  Waiting for students to scan QR code or open link...
                </span>
              )}
            </div>
          </div>

          {/* Wi-Fi Local Network Info Banner */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5">
            <Wifi size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">
                {networkInfo?.primaryIp ? `Local Wi-Fi: ${networkInfo.primaryIp}:${networkInfo.port}` : 'Local Network Ready'}
              </span>
              <p className="text-slate-400 text-[10.5px] mt-0.5">
                All devices connected to the same classroom Wi-Fi can participate with sub-second latency.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Users size={14} className="text-blue-600" />
            <span>Interactive Multi-User Mode</span>
          </div>

          <div className="flex items-center gap-2">
            {'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="px-3.5 py-1.5 rounded-full border border-slate-200 hover:bg-white text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                Share App...
              </button>
            )}
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
