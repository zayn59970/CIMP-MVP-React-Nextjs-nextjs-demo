"use client";

import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import _ from "lodash";
import { useEffect, useState } from "react";
import {
  SettingsAccount,
  useGetAccountSettingsQuery,
  useUpdateAccountSettingsMutation,
} from "../SettingsApi";
import { useSession } from "next-auth/react";
import { supabaseClient } from "@/utils/supabaseClient";
import { useAppDispatch } from "@/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import { display } from "@mui/system";

type FormType = SettingsAccount;

const defaultValues: FormType = {
  id: "",
  name: "",
  username: "",
  title: "",
  company: "",
  about: "",
  email: "",
  phone: "",
  country: "",
  language: "",
  userId: "",
  photoURL: "",
};

/**
 * Form Validation Schema
 */
const schema = z.object({
  name: z.string().nonempty("Name is required"),
  username: z.string().nonempty("Username is required"),
  title: z.string().nonempty("Title is required"),
  company: z.string().nonempty("Company is required"),
  about: z.string().nonempty("About is required"),
  email: z.string().email("Invalid email").nonempty("Email is required"),
  phone: z.string().nonempty("Phone is required"),
  country: z.string().nonempty("Country is required"),
  language: z.string().nonempty("Language is required"),
});

function AccountTab() {
  const { data } = useSession();
  const userId = data?.db?.id || "unknown-user-id";
  const currentPhotoUrl = data?.db?.photoURL || null;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  const [accountSettings, setAccountSettings] = useState<FormType | null>(null);

  const fetchAccountSetting = async (): Promise<void> => {
    const { data: result, error } = await supabaseClient
      .from("app_account_setting")
      .select("*")
      .eq("userId", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching settings:", error);
      return;
    }

    setAccountSettings(result || null);
  };

  useEffect(() => {
    fetchAccountSetting();
  }, [userId]);

  const { control, reset, handleSubmit, formState } = useForm<FormType>({
    defaultValues,
    mode: "all",
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;

  useEffect(() => {
    if (accountSettings) {
      reset(accountSettings);
    }
  }, [accountSettings, reset]);

  /**
   * Form Submit
   */

  async function onSubmit(formData: FormType) {
	let photoUrl = currentPhotoUrl;
  
	if (selectedFile) {
	  const fileName = `${userId}-${Date.now()}`;
	  const { data: uploadData, error: uploadError } = await supabaseClient.storage
		.from("users-photo")
		.upload(fileName, selectedFile);
  
	  if (uploadError) {
		console.error("Error uploading photo:", uploadError.message);
		dispatch(showMessage({ message: "Error uploading photo", autoHideDuration: 2000 }));
		return;
	  }
  
	  photoUrl = supabaseClient.storage
		.from("users-photo")
		.getPublicUrl(uploadData.path).data.publicUrl;
	}
  
	const fullData = {
	  ...formData,
	  userId,
	  photoURL: photoUrl,
	};
  
	await updateUserName(fullData.name, photoUrl);

    if (!accountSettings) {
      const { error } = await supabaseClient
        .from("app_account_setting")
        .insert([fullData]);

      if (error) {
        console.error("Error inserting new account settings:", error.message);
      } else {
        dispatch(
          showMessage({
            message: "Inserted new account settings",
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "right" },
          })
        );
        fetchAccountSetting();
        reset(fullData);
      }
    } else {
      const { error } = await supabaseClient
        .from("app_account_setting")
        .update(fullData)
        .eq("userId", userId);

      if (error) {
        console.error("Error updating account settings:", error.message);
      } else {
        dispatch(
          showMessage({
            message: "Updated account settings",
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "right" },
          })
        );
        fetchAccountSetting();
        reset(fullData);
      }
    }
  }

  const updateUserName = async (name: string, photoURL: string | null) => {
    const { error } = await supabaseClient
      .from("users")
      .update({ displayName: name, photoURL })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user name in users table:", error.message);
      dispatch(
        showMessage({
          message: "Failed to update user's name",
          variant: "error",
          autoHideDuration: 2000,
          anchorOrigin: { vertical: "top", horizontal: "right" },
        })
      );
    }
  };
  useEffect(() => {
	return () => {
	  if (previewUrl) URL.revokeObjectURL(previewUrl);
	};
  }, [previewUrl]);
  
  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between gap-6 mb-8">
          <div>
            <Typography className="text-xl">Profile</Typography>
            <Typography color="text.secondary">
              Following information is publicly displayed, be careful!
            </Typography>
          </div>

          <Controller
            control={control}
            name="photoURL"
            render={({ field }) => (
              <div className="relative w-[70px] h-[70px]">
                <img
                  src={previewUrl || currentPhotoUrl || "/default-avatar.png"}
                  alt="Profile"
                  className="w-[70px] h-[70px] rounded-full object-cover"
                />
                <label htmlFor="upload-photo">
                  <input
                    id="upload-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                        field.onChange(file); // still update form state
                      }
                    }}
                  />
                  <FuseSvgIcon
                    size={20}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white rounded-full p-1 shadow cursor-pointer"
                  >
                    heroicons-solid:pencil
                  </FuseSvgIcon>
                </label>
              </div>
            )}
          />
        </div>
        <div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
          <div className="sm:col-span-4">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  placeholder="Name"
                  id="name"
                  error={!!errors.name}
                  helperText={errors?.name?.message}
                  variant="outlined"
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:user-circle
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="sm:col-span-4">
            <Controller
              control={control}
              name="username"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Username"
                  placeholder="Username"
                  id="user-name"
                  error={!!errors.username}
                  helperText={errors?.username?.message}
                  variant="outlined"
                  required
                  fullWidth
                />
              )}
            />
          </div>
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <TextField
                  className=""
                  {...field}
                  label="Title"
                  placeholder="Job title"
                  id="title"
                  error={!!errors.title}
                  helperText={errors?.title?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:briefcase
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="company"
              render={({ field }) => (
                <TextField
                  className=""
                  {...field}
                  label="Company"
                  placeholder="Company"
                  id="company"
                  error={!!errors.company}
                  helperText={errors?.company?.message}
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:building-office-2
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="sm:col-span-4">
            <Controller
              control={control}
              name="about"
              render={({ field }) => (
                <TextField
                  className=""
                  {...field}
                  label="Notes"
                  placeholder="Notes"
                  id="notes"
                  error={!!errors.about}
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={5}
                  maxRows={10}
                  InputProps={{
                    className: "max-h-min h-min items-start",
                    startAdornment: (
                      <InputAdornment className="mt-16" position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:bars-3-bottom-left
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    <span className="flex flex-col">
                      <span>
                        Brief description for your profile. Basic HTML and Emoji
                        are allowed.
                      </span>
                      <span>{errors?.about?.message}</span>
                    </span>
                  }
                />
              )}
            />
          </div>
        </div>

        <div className="my-40 border-t" />
        <div className="w-full">
          <Typography className="text-xl">Personal Information</Typography>
          <Typography color="text.secondary">
            Communication details in case we want to connect with you. These
            will be kept private.
          </Typography>
        </div>
        <div className="grid w-full gap-24 sm:grid-cols-4 mt-32">
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  placeholder="Email"
                  variant="outlined"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors?.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:envelope
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  placeholder="Phone Number"
                  variant="outlined"
                  fullWidth
                  error={!!errors.phone}
                  helperText={errors?.phone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:phone
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="country"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Country"
                  placeholder="County"
                  variant="outlined"
                  fullWidth
                  error={!!errors.country}
                  helperText={errors?.country?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:flag
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
          <div className="sm:col-span-2">
            <Controller
              control={control}
              name="language"
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Language"
                  placeholder="Language"
                  variant="outlined"
                  fullWidth
                  error={!!errors.language}
                  helperText={errors?.language?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FuseSvgIcon size={20}>
                          heroicons-solid:globe-alt
                        </FuseSvgIcon>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </div>
        </div>

        <Divider className="mb-40 mt-44 border-t" />
        <div className="flex items-center justify-end space-x-8">
          <Button
            variant="outlined"
            disabled={_.isEmpty(dirtyFields)}
            onClick={() => reset(accountSettings)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={_.isEmpty(dirtyFields) || !isValid}
            type="submit"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AccountTab;
