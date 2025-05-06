import { useDebounce, useDeepCompareEffect } from "@fuse/hooks";
import _ from "lodash";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import clsx from "clsx";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import { fromUnixTime } from "date-fns/fromUnixTime";
import { getUnixTime } from "date-fns/getUnixTime";
import { format } from "date-fns/format";
import { Controller, useForm } from "react-hook-form";
import { SyntheticEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/store/hooks";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import Box from "@mui/material/Box";
import { useParams } from "next/navigation";
import FuseLoading from "@fuse/core/FuseLoading";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import {
  closeCardDialog,
  selectCardDialogData,
} from "../../../../scrumboardSlice";
import CardActivity from "./activity/CardActivity";
import CardAttachment from "./attachment/CardAttachment";
import CardChecklist from "./checklist/CardChecklist";
import CardComment from "./comment/CardComment";
import DueMenu from "./toolbar/DueMenu";
import LabelsMenu from "./toolbar/LabelsMenu";
import MembersMenu from "./toolbar/MembersMenu";
import CheckListMenu from "./toolbar/CheckListMenu";
import OptionsMenu from "./toolbar/OptionsMenu";
import {
  ScrumboardCard,
  ScrumboardChecklist,
  ScrumboardComment,
  ScrumboardLabel,
} from "../../../../ScrumboardApi";
import setIn from "@/utils/setIn";
import { supabaseClient } from "@/utils/supabaseClient";

function BoardCardForm({ refreshKey }: any) {
  const dispatch = useAppDispatch();
  const routeParams = useParams<{ boardId: string }>();
  const { boardId } = routeParams;

  const card = useAppSelector(selectCardDialogData);

  const [board, setBoard] = useState(null);
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { register, watch, control, setValue, formState } = useForm({
    mode: "onChange",
    defaultValues: card,
  });
  const { isValid } = formState;
  const cardForm = watch();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boardResponse, membersResponse, labelsResponse, listsResponse] =
        await Promise.all([
          supabaseClient
            .from("scrumboard_board")
            .select("*")
            .eq("id", boardId)
            .single(),
          supabaseClient.from("users").select("*"),
          supabaseClient
            .from("scrumboard_label")
            .select("*")
            .eq("boardid", boardId),
          supabaseClient
            .from("scrumboard_list")
            .select("*")
            .eq("boardid", boardId),
        ]);

      setBoard(boardResponse.data);
      setMembers(membersResponse.data);
      setLabels(labelsResponse.data);
      setListItems(listsResponse.data);
    } catch (error) {
      dispatch(
        showMessage({
          message: "Failed to fetch data",
          autoHideDuration: 2000,
          anchorOrigin: { vertical: "top", horizontal: "right" },
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [boardId]);

  const updateCardData = useDebounce(async (newCard: ScrumboardCard) => {
    try {
      const { error } = await supabaseClient
        .from("scrumboard_card")
        .update(newCard)
        .eq("id", newCard.id);
      if (!error) {
        dispatch(
          showMessage({
            message: "Card Saved",
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "right" },
          })
        );
      }
    } catch (error) {
      console.error("Error updating card:", error);
    }
  }, 600);

  useDeepCompareEffect(() => {
    if (!_.isEqual(card, cardForm) && isValid) {
      updateCardData(cardForm);
      console.log("card updated");
      refreshKey();
    }
  }, [cardForm, isValid]);

  useEffect(() => {
    register("attachmentCoverId");
  }, [register]);

  if (loading) {
    return <FuseLoading />;
  }

  async function removeCard(cardId: string) {
    try {
      // 1. Delete the card
      const { error: deleteError } = await supabaseClient
        .from("scrumboard_card")
        .delete()
        .eq("id", cardId);
  
      if (deleteError) {
        console.error("Error deleting card:", deleteError.message);
        return;
      }
  
      // 2. Get current board with lists
      const { data: boardData, error: boardError } = await supabaseClient
        .from("scrumboard_board")
        .select("lists")
        .eq("id", boardId)
        .single();
  
      if (boardError) {
        console.error("Error fetching board data:", boardError.message);
        return;
      }
  
      const updatedLists = (boardData.lists || []).map((list: any) =>
        list.cards?.includes(cardId)
          ? { ...list, cards: list.cards.filter((id: string) => id !== cardId) }
          : list
      );
  
      // 3. Update the lists field on the board
      const { error: updateError } = await supabaseClient
        .from("scrumboard_board")
        .update({ lists: updatedLists })
        .eq("id", boardId);
  
      if (updateError) {
        console.error("Error updating board lists:", updateError.message);
        return;
      }
  
      dispatch(closeCardDialog());
      dispatch(
        showMessage({
          message: "Card Removed",
          autoHideDuration: 2000,
          anchorOrigin: { vertical: "top", horizontal: "right" },
        })
      );
  
      refreshKey();
    } catch (err) {
      console.error("Unexpected error during card removal:", err);
    }
  }
  

  const list = _.find(listItems, { id: card?.listId });
  return (
    <DialogContent className="flex flex-col sm:flex-row p-8">
      <div className="flex flex-auto flex-col py-16 px-0 sm:px-16">
        <div className="flex flex-col sm:flex-row sm:justify-between justify-center items-center mb-24">
          <div className="mb-16 sm:mb-0 flex items-center">
            <Typography>{board?.title}</Typography>

            <FuseSvgIcon size={20}>heroicons-outline:chevron-right</FuseSvgIcon>

            <Typography>{list && list.title}</Typography>
          </div>

          {cardForm.dueDate && (
            <DateTimePicker
              value={new Date(format(fromUnixTime(cardForm.dueDate), "Pp"))}
              format="Pp"
              onChange={(val) => setValue("dueDate", getUnixTime(val))}
              className="w-full sm:w-auto"
              slotProps={{
                textField: {
                  label: "Due date",
                  placeholder: "Choose a due date",
                  InputLabelProps: {
                    shrink: true,
                  },
                  fullWidth: true,
                  variant: "outlined",
                },
              }}
            />
          )}
        </div>

        <div className="flex items-center mb-24">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                type="text"
                variant="outlined"
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {card?.subscribed && (
                        <FuseSvgIcon size={20} color="action">
                          heroicons-outline:eye
                        </FuseSvgIcon>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </div>

        <div className="w-full mb-24">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ""} // ✅ fallback to empty string
                label="Description"
                multiline
                rows="4"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        {cardForm.labels && cardForm.labels?.length > 0 && (
          <div className="flex-1 mb-24 mx-8">
            <div className="flex items-center mt-16 mb-12">
              <FuseSvgIcon size={20}>heroicons-outline:tag</FuseSvgIcon>
              <Typography className="font-semibold text-15 mx-8">
                Labels
              </Typography>
            </div>
            <Autocomplete
              className="mt-8 mb-16"
              multiple
              freeSolo
              options={labels}
              getOptionLabel={(option: string | ScrumboardLabel) => {
                if (typeof option === "string") {
                  return option;
                }

                return option?.title;
              }}
              value={cardForm.labels.map((id) => _.find(labels, { id }))}
              onChange={(
                _event: SyntheticEvent<Element, Event>,
                value: (string | ScrumboardLabel)[]
              ) => {
                const ids = value
                  .filter(
                    (item): item is ScrumboardLabel => typeof item !== "string"
                  )
                  .map((item) => item.id);
                setValue("labels", ids);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...rest } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={
                        typeof option === "string" ? option : option?.title
                      }
                      className="m-3"
                      {...rest}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select multiple Labels"
                  label="Labels"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </div>
        )}

        {cardForm.memberIds && cardForm.memberIds?.length > 0 && (
          <div className="flex-1 mb-24 mx-8">
            <div className="flex items-center mt-16 mb-12">
              <FuseSvgIcon size={20}>heroicons-outline:users</FuseSvgIcon>
              <Typography className="font-semibold text-15 mx-8">
                Members
              </Typography>
            </div>
            <Autocomplete
              className="mt-8 mb-16"
              multiple
              freeSolo
              options={members}
              getOptionLabel={(member: string | any) => {
                return typeof member === "string"
                  ? member
                  : member?.displayName;
              }}
              value={cardForm.memberIds.map((id) => _.find(members, { id }))}
              onChange={(
                _event: SyntheticEvent<Element, Event>,
                value: (string | any)[]
              ) => {
                const ids = value
                  .filter((item): item is any => typeof item !== "string")
                  .map((item) => item.id);
                setValue("memberIds", ids);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  if (typeof option === "string") {
                    // eslint-disable-next-line react/jsx-key
                    return <span />;
                  }

                  const { key, ...rest } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option?.displayName}
                      className={clsx("m-3", option?.class)}
                      {...rest}
                      avatar={
                        <Tooltip title={option?.displayName}>
                          <Avatar src={option?.photoURL} />
                        </Tooltip>
                      }
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select multiple Members"
                  label="Members"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              )}
            />
          </div>
        )}

        {cardForm.attachments && cardForm.attachments?.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center mt-16 mb-12">
              <FuseSvgIcon size={20}>heroicons-outline:paper-clip</FuseSvgIcon>
              <Typography className="font-semibold text-15 mx-8">
                Attachments
              </Typography>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap -mx-16">
              {cardForm.attachments.map((item) => (
                <CardAttachment
                  item={item}
                  card={cardForm}
                  makeCover={() => {
                    setValue("attachmentCoverId", item.id);
                  }}
                  removeCover={() => {
                    setValue("attachmentCoverId", "");
                  }}
                  removeAttachment={() => {
                    setValue(
                      "attachments",
                      _.reject(cardForm.attachments, { id: item.id })
                    );
                  }}
                  key={item.id}
                />
              ))}
            </div>
          </div>
        )}

        {cardForm.checklists &&
          cardForm.checklists.map((checklist, index) => (
            <CardChecklist
              key={checklist.id}
              checklist={checklist}
              index={index}
              onCheckListChange={(item, itemIndex) => {
                setValue(
                  "checklists",
                  setIn(
                    cardForm.checklists,
                    `[${itemIndex}]`,
                    item
                  ) as ScrumboardChecklist[]
                );
              }}
              onRemoveCheckList={() => {
                setValue(
                  "checklists",
                  _.reject(cardForm.checklists, { id: checklist.id })
                );
              }}
            />
          ))}

        <div className="mb-24">
          <div className="flex items-center mt-16 mb-12">
            <FuseSvgIcon size={20}>
              heroicons-outline:chat-bubble-left-right
            </FuseSvgIcon>
            <Typography className="font-semibold text-15 mx-8">
              Comment
            </Typography>
          </div>
          <div>
            <CardComment
              onCommentAdd={(comment) =>
                setValue("activities", [
                  comment,
                  ...cardForm.activities,
                ] as ScrumboardComment[])
              }
            />
          </div>
        </div>

        <Controller
          name="activities"
          control={control}
          defaultValue={[]}
          render={({ field: { value } }) => (
            <div>
              {value?.length > 0 && (
                <div className="mb-24">
                  <div className="flex items-center mt-16">
                    <FuseSvgIcon size={20}>
                      heroicons-outline:clipboard-document-list
                    </FuseSvgIcon>
                    <Typography className="font-semibold text-15 mx-8">
                      Activity
                    </Typography>
                  </div>
                  <List>
                    {value.map((item) => (
                      <CardActivity item={item} key={item.id} />
                    ))}
                  </List>
                </div>
              )}
            </div>
          )}
        />
      </div>

      <div className="flex order-first sm:order-last items-start sticky top-0">
        <Box
          className="flex flex-row sm:flex-col items-center rounded-lg w-full overflow-hidden"
          sx={{ backgroundColor: "background.default" }}
        >
          <IconButton
            className="order-last sm:order-first rounded-0"
            color="inherit"
            onClick={() => dispatch(closeCardDialog())}
            size="large"
          >
            <FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
          </IconButton>
          <div className="flex flex-row items-center sm:items-start sm:flex-col flex-1">
            <Controller
              name="dueDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DueMenu
                  onDueChange={onChange}
                  onRemoveDue={() => onChange(null)}
                  dueDate={value}
                />
              )}
            />

            <Controller
              name="labels"
              control={control}
              defaultValue={[]}
              render={({ field: { onChange, value } }) => (
                <LabelsMenu
                  onToggleLabel={(labelId) => onChange(_.xor(value, [labelId]))}
                  labels={value}
                  boardLabels={labels}
                />
              )}
            />

            <Controller
              name="memberIds"
              control={control}
              defaultValue={[]}
              render={({ field: { onChange, value } }) => (
                <MembersMenu
                  onToggleMember={(memberId) =>
                    onChange(_.xor(value, [memberId]))
                  }
                  memberIds={value}
                  members={members}
                />
              )}
            />
            <Controller
              name="attachments"
              control={control}
              defaultValue={[]}
              render={({ field: { onChange, value } }) => (
                <>
                  <input
                    accept="image/*,application/pdf"
                    style={{ display: "none" }}
                    id="attachment-upload"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const fileExt = file.name.split(".").pop();
                      const fileName = `${Date.now()}.${fileExt}`;
                      const filePath = `${cardForm.id}/${fileName}`;

                      const { data, error } = await supabaseClient.storage
                        .from("scrumboard-attachments")
                        .upload(filePath, file);

                      if (error) {
                        dispatch(
                          showMessage({
                            message: "Failed to upload attachment",
                            variant: "error",
                          })
                        );
                        return;
                      }

                      const publicUrl = supabaseClient.storage
                        .from("scrumboard-attachments")
                        .getPublicUrl(filePath).data.publicUrl;

                      const newAttachment = {
                        id: crypto.randomUUID(),
                        url: publicUrl,
                        name: file.name,
                        time: Date.now(),
                        type: file.type.startsWith("image/") ? "image" : "link",
                      };

                      onChange([...value, newAttachment]);
                    }}
                  />
                  <label htmlFor="attachment-upload">
                    <IconButton
                      component="span"
                      size="large"
                      className="rounded-0"
                    >
                      <FuseSvgIcon>heroicons-outline:paper-clip</FuseSvgIcon>
                    </IconButton>
                  </label>
                </>
              )}
            />

            <Controller
              name="checklists"
              control={control}
              defaultValue={[]}
              render={({ field: { onChange } }) => (
                <CheckListMenu
                  onAddCheckList={(newList) =>
                    onChange([...cardForm.checklists, newList])
                  }
                />
              )}
            />

            <OptionsMenu
							onRemoveCard={() => {
                removeCard(card.id)
									.then(() => {
										dispatch(closeCardDialog());
										dispatch(
											showMessage({
												message: 'Card Removed',
												autoHideDuration: 2000,
												anchorOrigin: {
													vertical: 'top',
													horizontal: 'right'
												}
											})
										);
									});
							}}
						/>
          </div>
        </Box>
      </div>
    </DialogContent>
  );
}

export default BoardCardForm;
