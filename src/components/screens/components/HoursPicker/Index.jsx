import React, { useState, useEffect } from 'react';
import { Clock, X, ChevronUp, ChevronDown } from 'lucide-react';
import styles from './Index.module.css';
import TextField from '../Material-UI/Components/TextField/Index';
import Frame from '../Frame/Index';
import Button from '../Button/index';
import {
    TEXT_HOURS_PICKER,
    HOURS_LIST,
    MINUTES_LIST,
    QUICK_TIMES
} from './Constants';
import {
    parseTimeTo12h,
    format12hTo24h,
    getDisplayTimeText,
    getCurrentTime12h
} from './utils';

const HoursPicker = ({ label, name, value, onChange, required = false, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hours, setHours] = useState(12);
    const [minutes, setMinutes] = useState(0);
    const [period, setPeriod] = useState('AM');
    const [activeTab, setActiveTab] = useState(null); // null, 'hours', 'minutes'

    useEffect(() => {
        const parsed = parseTimeTo12h(value);
        setHours(parsed.hours);
        setMinutes(parsed.minutes);
        setPeriod(parsed.period);
    }, [value, isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setActiveTab(null);
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const incrementHours = () => setHours(prev => (prev === 12 ? 1 : prev + 1));
    const decrementHours = () => setHours(prev => (prev === 1 ? 12 : prev - 1));
    const incrementMinutes = () => setMinutes(prev => (prev + 5 >= 60 ? 0 : Math.floor(prev / 5) * 5 + 5));
    const decrementMinutes = () => setMinutes(prev => (prev - 5 < 0 ? 55 : Math.floor(prev / 5) * 5 - 5));

    const handleConfirm = () => {
        const formatted = format12hTo24h(hours, minutes, period);
        if (typeof onChange === 'function') {
            onChange({
                target: {
                    name,
                    value: formatted,
                    type: 'time'
                }
            });
        }
        setIsOpen(false);
        setActiveTab(null);
    };

    const handleClear = () => {
        if (typeof onChange === 'function') {
            onChange({
                target: {
                    name,
                    value: '',
                    type: 'time'
                }
            });
        }
        setIsOpen(false);
        setActiveTab(null);
    };

    const handleSetNow = () => {
        const now = getCurrentTime12h();
        setHours(now.hours);
        setMinutes(now.minutes);
        setPeriod(now.period);
    };

    const handleQuickPreset = (preset) => {
        let h12 = preset.h24 % 12;
        if (h12 === 0) h12 = 12;
        const p = preset.h24 >= 12 ? 'PM' : 'AM';
        setHours(h12);
        setMinutes(preset.m);
        setPeriod(p);
    };

    const headerContent = (
        <div className={styles.header}>
            <span className={styles.modalTitle}>{TEXT_HOURS_PICKER.TITLE}</span>
            <Button
                variant="ghost"
                size="small"
                circle
                onClick={() => { setIsOpen(false); setActiveTab(null); }}
                icon={X}
                color="var(--cancel-button)"
            />
        </div>
    );

    return (
        <div className={styles.inputGroup} onClick={(e) => e.stopPropagation()}>
            <TextField
                label={label}
                value={getDisplayTimeText(value, hours, minutes, period)}
                readOnly
                placeholder={TEXT_HOURS_PICKER.PLACEHOLDER}
                onClick={() => !disabled && setIsOpen(true)}
                disabled={disabled}
                required={required}
                slotProps={{
                    input: {
                        endAdornment: (
                            <Clock
                                size={16}
                                style={{ cursor: 'pointer', color: '#64748b' }}
                                onClick={() => !disabled && setIsOpen(true)}
                            />
                        )
                    }
                }}
            />

            {isOpen && (
                <Frame
                    isModal={true}
                    onClose={() => { setIsOpen(false); setActiveTab(null); }}
                    className={styles.hoursFrame}
                >
                    {headerContent}

                    {/* MAIN TIME SELECTOR DISPLAY */}
                    <div className={styles.timeDisplaySection}>
                        {/* Hours Column */}
                        <div className={styles.timeColumn}>
                            <Button
                                variant="ghost"
                                size="small"
                                circle
                                icon={ChevronUp}
                                onClick={incrementHours}
                                color="inherit"
                                title="Incrementar hora"
                            />
                            <Button
                                variant={activeTab === 'hours' ? 'primary' : 'outline'}
                                size="large"
                                onClick={() => setActiveTab(activeTab === 'hours' ? null : 'hours')}
                                color={activeTab === 'hours' ? '#10b981' : '#0f172a'}
                                style={{
                                    minWidth: '58px',
                                    height: '54px',
                                    fontSize: '1.5rem',
                                    fontWeight: 800
                                }}
                            >
                                {String(hours).padStart(2, '0')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="small"
                                circle
                                icon={ChevronDown}
                                onClick={decrementHours}
                                color="inherit"
                                title="Decrementar hora"
                            />
                        </div>

                        <span className={styles.timeSeparator}>:</span>

                        {/* Minutes Column */}
                        <div className={styles.timeColumn}>
                            <Button
                                variant="ghost"
                                size="small"
                                circle
                                icon={ChevronUp}
                                onClick={incrementMinutes}
                                color="inherit"
                                title="Incrementar minutos"
                            />
                            <Button
                                variant={activeTab === 'minutes' ? 'primary' : 'outline'}
                                size="large"
                                onClick={() => setActiveTab(activeTab === 'minutes' ? null : 'minutes')}
                                color={activeTab === 'minutes' ? '#10b981' : '#0f172a'}
                                style={{
                                    minWidth: '58px',
                                    height: '54px',
                                    fontSize: '1.5rem',
                                    fontWeight: 800
                                }}
                            >
                                {String(minutes).padStart(2, '0')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="small"
                                circle
                                icon={ChevronDown}
                                onClick={decrementMinutes}
                                color="inherit"
                                title="Decrementar minutos"
                            />
                        </div>

                        {/* Period Column (AM / PM) */}
                        <div className={styles.periodColumn}>
                            <Button
                                variant={period === 'AM' ? 'primary' : 'ghost'}
                                size="small"
                                onClick={() => setPeriod('AM')}
                                color={period === 'AM' ? '#0f172a' : 'inherit'}
                                style={{ minWidth: '48px' }}
                            >
                                AM
                            </Button>
                            <Button
                                variant={period === 'PM' ? 'primary' : 'ghost'}
                                size="small"
                                onClick={() => setPeriod('PM')}
                                color={period === 'PM' ? '#0f172a' : 'inherit'}
                                style={{ minWidth: '48px' }}
                            >
                                PM
                            </Button>
                        </div>
                    </div>

                    {/* EXPANDABLE DIRECT NUMBER SELECTION */}
                    {activeTab === 'hours' && (
                        <div className={styles.quickSelectGrid}>
                            {HOURS_LIST.map(h => (
                                <Button
                                    key={h}
                                    variant={hours === h ? 'primary' : 'outline'}
                                    size="small"
                                    onClick={() => { setHours(h); setActiveTab(null); }}
                                    color={hours === h ? '#0f172a' : 'inherit'}
                                    style={{ minWidth: 'auto', padding: '4px 0' }}
                                >
                                    {String(h).padStart(2, '0')}
                                </Button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'minutes' && (
                        <div className={styles.quickSelectGrid}>
                            {MINUTES_LIST.map(m => (
                                <Button
                                    key={m}
                                    variant={minutes === m ? 'primary' : 'outline'}
                                    size="small"
                                    onClick={() => { setMinutes(m); setActiveTab(null); }}
                                    color={minutes === m ? '#0f172a' : 'inherit'}
                                    style={{ minWidth: 'auto', padding: '4px 0' }}
                                >
                                    {String(m).padStart(2, '0')}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* QUICK PRESETS */}
                    {!activeTab && (
                        <div className={styles.presetsSection}>
                            <div className={styles.presetsTitle}>{TEXT_HOURS_PICKER.QUICK_PRESETS_TITLE}</div>
                            <div className={styles.presetsGrid}>
                                {QUICK_TIMES.map((qt, idx) => {
                                    let h12 = qt.h24 % 12 || 12;
                                    let p = qt.h24 >= 12 ? 'PM' : 'AM';
                                    const isActive = hours === h12 && minutes === qt.m && period === p;
                                    return (
                                        <Button
                                            key={idx}
                                            variant={isActive ? 'primary' : 'outline'}
                                            size="small"
                                            onClick={() => handleQuickPreset(qt)}
                                            color={isActive ? '#10b981' : 'inherit'}
                                            style={{ fontSize: '0.72rem', padding: '4px 2px', minWidth: 'auto' }}
                                        >
                                            {qt.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* FOOTER ACTIONS */}
                    <div className={styles.footer}>
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={handleClear}
                            color="inherit"
                        >
                            {TEXT_HOURS_PICKER.BUTTON_CLEAR}
                        </Button>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                                variant="ghost"
                                size="small"
                                onClick={handleSetNow}
                                color="green"
                            >
                                {TEXT_HOURS_PICKER.BUTTON_NOW}
                            </Button>
                            <Button
                                variant="primary"
                                size="small"
                                onClick={handleConfirm}
                                color="#0f172a"
                            >
                                {TEXT_HOURS_PICKER.BUTTON_CONFIRM}
                            </Button>
                        </div>
                    </div>
                </Frame>
            )}
        </div>
    );
};

export default HoursPicker;
