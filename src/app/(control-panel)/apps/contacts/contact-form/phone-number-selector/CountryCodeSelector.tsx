import _ from 'lodash';
import { MouseEvent, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Box from '@mui/system/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import clsx from 'clsx';
import { supabaseClient } from '@/utils/supabaseClient';

type CountryCodeSelectorProps = {
  value: string;
  onChange: (T: string) => void;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
};

type Country = {
  iso: string;
  code: string;
  flagImagePos: string;
};

/**
 * The country code selector.
 */
function CountryCodeSelector(props: CountryCodeSelectorProps) {
  const { value, onChange, className, ref } = props;
  const [countries, setCountries] = useState<Country[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Fetch countries from Supabase
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('countries')
          .select('*');
        if (error) {
          console.error('Error fetching countries:', error.message);
        } else {
          setCountries(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchCountries();
  }, []);

  const country = _.find(countries, { iso: value });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div ref={ref}>
      <Button
        className={clsx('flex items-center', className)}
        id="country-button"
        aria-controls={open ? 'country-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        disableRipple
      >
        <Box
          component="span"
          className="w-24 h-16 overflow-hidden"
          sx={{
            background: "url('/assets/images/apps/contacts/flags.png') no-repeat 0 0",
            backgroundSize: '24px 3876px',
            backgroundPosition: country?.flagImagePos
          }}
        />
        <span className="ml-8 font-medium">{country?.code}</span>
      </Button>
      <Menu
        id="country-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button'
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {countries.map((item) => (
          <MenuItem
            onClick={() => {
              onChange(item.iso);
              handleClose();
            }}
            disableRipple
            key={item.iso}
          >
            <Box
              component="span"
              className="w-24 h-16 overflow-hidden"
              sx={{
                background: "url('/assets/images/apps/contacts/flags.png') no-repeat 0 0",
                backgroundSize: '24px 3876px',
                backgroundPosition: item.flagImagePos
              }}
            />
            <span className="ml-8 font-medium">{item.code}</span>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export default CountryCodeSelector;
