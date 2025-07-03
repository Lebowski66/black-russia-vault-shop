
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// Currency amounts and their prices (in rubles)
const CURRENCY_OPTIONS = {
  '1kk': { amount: '1,000,000', price: 50 },
  '5kk': { amount: '5,000,000', price: 200 },
  '10kk': { amount: '10,000,000', price: 350 },
  '50kk': { amount: '50,000,000', price: 1500 }
};

const SERVERS = ['Saturn', 'Mars', 'Pluto', 'Jupiter'];

interface TelegramWebApp {
  sendData: (data: string) => void;
  ready: () => void;
  expand: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const GameStore = () => {
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<keyof typeof CURRENCY_OPTIONS | ''>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [priceAnimationKey, setPriceAnimationKey] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
    
    // Trigger fade-in animation
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  useEffect(() => {
    // Trigger price animation when amount changes
    if (selectedAmount) {
      setPriceAnimationKey(prev => prev + 1);
    }
  }, [selectedAmount]);

  const handlePayment = () => {
    if (!selectedServer || !playerId || !selectedAmount) {
      toast({
        title: "⚠️ Заполните все поля",
        description: "Пожалуйста, выберите сервер, введите ID игрока и выберите количество валюты",
        variant: "destructive"
      });
      return;
    }

    const paymentData = {
      server: selectedServer,
      player_id: playerId,
      amount: selectedAmount,
      price: CURRENCY_OPTIONS[selectedAmount].price
    };

    // Send data to Telegram bot
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify(paymentData));
      toast({
        title: "✅ Данные отправлены боту!",
        description: "Ожидайте дальнейших инструкций для оплаты",
      });
    } else {
      // Fallback for development
      console.log('Payment data:', paymentData);
      toast({
        title: "✅ Данные отправлены!",
        description: `Сервер: ${selectedServer}, ID: ${playerId}, Сумма: ${CURRENCY_OPTIONS[selectedAmount].price}₽`,
      });
    }
  };

  const currentPrice = selectedAmount ? CURRENCY_OPTIONS[selectedAmount].price : 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className={`w-full max-w-md space-y-6 transition-all duration-700 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-gaming-purple bg-clip-text text-transparent">
            Магазин игровой валюты
          </h1>
          <h2 className="text-xl font-semibold text-primary">Black Russia</h2>
        </div>

        {/* Main Form */}
        <Card className="gaming-card p-6 space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Server Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Выберите сервер
            </label>
            <Select onValueChange={setSelectedServer}>
              <SelectTrigger className="gaming-select transition-all duration-200 hover:border-primary/50 hover:bg-card/80">
                <SelectValue placeholder="Выберите сервер" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border animate-scale-in backdrop-blur-sm">
                {SERVERS.map((server) => (
                  <SelectItem 
                    key={server} 
                    value={server} 
                    className="text-foreground hover:bg-accent transition-colors duration-200"
                  >
                    {server}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Player ID Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              ID игрока
            </label>
            <Input
              type="number"
              placeholder="Введите ваш ID"
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="gaming-input transition-all duration-200 hover:border-primary/50 focus:scale-[1.02]"
            />
          </div>

          {/* Amount Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Количество валюты
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CURRENCY_OPTIONS).map(([key, { amount, price }]) => (
                <div
                  key={key}
                  className={`amount-option hover-scale transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${
                    selectedAmount === key ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedAmount(key as keyof typeof CURRENCY_OPTIONS)}
                >
                  <div className="text-lg font-bold text-primary">{key}</div>
                  <div className="text-xs text-muted-foreground">{amount}</div>
                  <div className="text-sm font-medium text-gaming-blue">{price}₽</div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Display */}
          {selectedAmount && (
            <div className="gaming-card p-4 text-center space-y-1 animate-fade-in">
              <div className="text-sm text-muted-foreground">Итого к оплате</div>
              <div 
                key={priceAnimationKey}
                className="text-2xl font-bold text-primary animate-scale-in price-animation"
              >
                {currentPrice}₽
              </div>
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={!selectedServer || !playerId || !selectedAmount}
            className="gaming-button w-full py-3 text-lg font-semibold transition-all duration-200 transform hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Оплатить
          </Button>

          {/* Payment Instructions */}
          <div className="text-center space-y-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p>После оплаты отправьте чек в Telegram</p>
            <p>@blackrussia_support</p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.5s' }}>
          2025 © Black Russia Market
        </div>
      </div>
    </div>
  );
};
