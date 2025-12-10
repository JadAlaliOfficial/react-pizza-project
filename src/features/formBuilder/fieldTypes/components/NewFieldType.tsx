// import * as React from "react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { Check, ChevronsUpDown, Info } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Checkbox } from "@/components/ui/checkbox";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Switch } from "@/components/ui/switch";
// import { Slider } from "@/components/ui/slider";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";
// import { Calendar as CalendarIcon } from "lucide-react";
// import { useFieldTypes } from "../hooks/useFieldTypes";
// import { useInputRules } from "../../inputRules/hooks/useInputRules";

// interface FieldType {
//   id: number;
//   name: string;
//   created_at: string;
//   updated_at: string;
// }

// interface InputRule {
//   id: number;
//   name: string;
//   description: string;
//   is_public: boolean;
//   field_types: Array<{
//     id: number;
//     name: string;
//     created_at: string;
//     updated_at: string;
//     pivot?: any;
//   }>;
//   created_at: string;
//   updated_at: string;
// }

// // Map of rule names to their parameter requirements
// const RULE_PARAMETERS: Record<string, { type: string; label: string; required?: boolean }[]> = {
//   min: [{ type: "number", label: "Minimum Value", required: true }],
//   max: [{ type: "number", label: "Maximum Value", required: true }],
//   between: [
//     { type: "number", label: "Min Value", required: true },
//     { type: "number", label: "Max Value", required: true },
//   ],
//   after: [{ type: "date", label: "After Date", required: true }],
//   after_or_equal: [{ type: "date", label: "After or Equal Date", required: true }],
//   before: [{ type: "date", label: "Before Date", required: true }],
//   before_or_equal: [{ type: "date", label: "Before or Equal Date", required: true }],
//   date_format: [{ type: "text", label: "Date Format (e.g., Y-m-d)", required: true }],
//   regex: [{ type: "text", label: "Regular Expression", required: true }],
//   mimes: [{ type: "text", label: "Allowed MIME types (comma-separated)", required: true }],
//   mimetypes: [{ type: "text", label: "MIME type patterns (comma-separated)", required: true }],
//   max_file_size: [{ type: "number", label: "Max File Size (KB)", required: true }],
//   min_file_size: [{ type: "number", label: "Min File Size (KB)", required: true }],
//   size: [{ type: "number", label: "Exact File Size (KB)", required: true }],
//   dimensions: [{ type: "text", label: "Dimensions (e.g., min_width=100,min_height=200)", required: true }],
//   starts_with: [{ type: "text", label: "Starts With Value(s)", required: true }],
//   ends_with: [{ type: "text", label: "Ends With Value(s)", required: true }],
//   in: [{ type: "text", label: "Allowed Values (comma-separated)", required: true }],
//   not_in: [{ type: "text", label: "Disallowed Values (comma-separated)", required: true }],
// };

// export function DynamicFieldBuilder() {
//   const [open, setOpen] = React.useState(false);
//   const [selectedFieldTypeId, setSelectedFieldTypeId] = React.useState<number | null>(null);
//   const [selectedRules, setSelectedRules] = React.useState<Set<number>>(new Set());
//   const [ruleParameters, setRuleParameters] = React.useState<Record<number, Record<string, any>>>({});

//   const { fieldTypes, isLoading: fieldTypesLoading, error: fieldTypesError, ensureLoaded: loadFieldTypes } = useFieldTypes();
//   const { items: inputRules, loading: inputRulesLoading, error: inputRulesError, refetch: loadInputRules } = useInputRules();

//   // Load data on mount
//   React.useEffect(() => {
//     loadFieldTypes();
//     loadInputRules();
//   }, [loadFieldTypes, loadInputRules]);

//   // Get applicable rules for selected field type
//   const applicableRules = React.useMemo(() => {
//     if (!selectedFieldTypeId || inputRules.length === 0) return [];
//     return inputRules.filter(rule =>
//       rule.field_types.some(ft => ft.id === selectedFieldTypeId)
//     );
//   }, [selectedFieldTypeId, inputRules]);

//   const selectedFieldType = fieldTypes.find(ft => ft.id === selectedFieldTypeId);

//   // Create dynamic form schema
//   const formSchema = React.useMemo(() => {
//     let schema: any = {
//       fieldValue: z.any(),
//     };

//     // Add validation rules parameters to schema
//     selectedRules.forEach(ruleId => {
//       const rule = inputRules.find(r => r.id === ruleId);
//       if (rule && RULE_PARAMETERS[rule.name]) {
//         RULE_PARAMETERS[rule.name].forEach((param, index) => {
//           const key = `rule_${ruleId}_param_${index}`;
//           if (param.required) {
//             schema[key] = param.type === 'number' 
//               ? z.number().min(0, "Value must be positive")
//               : z.string().min(1, "This field is required");
//           }
//         });
//       }
//     });

//     return z.object(schema);
//   }, [selectedRules, inputRules]);

//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       fieldValue: "",
//     },
//   });

//   const handleRuleToggle = (ruleId: number, enabled: boolean) => {
//     const newRules = new Set(selectedRules);
//     if (enabled) {
//       newRules.add(ruleId);
//     } else {
//       newRules.delete(ruleId);
//       // Remove parameters for disabled rule
//       setRuleParameters(prev => {
//         const newParams = { ...prev };
//         delete newParams[ruleId];
//         return newParams;
//       });
//     }
//     setSelectedRules(newRules);
//   };

//   const handleParameterChange = (ruleId: number, paramIndex: number, value: any) => {
//     setRuleParameters(prev => ({
//       ...prev,
//       [ruleId]: {
//         ...prev[ruleId],
//         [paramIndex]: value,
//       },
//     }));
//   };

//   const onSubmit = (data: any) => {
//     // Construct the final field configuration
//     const fieldConfig = {
//       fieldType: selectedFieldType,
//       value: data.fieldValue,
//       rules: Array.from(selectedRules).map(ruleId => {
//         const rule = inputRules.find(r => r.id === ruleId);
//         const params = ruleParameters[ruleId] || {};
//         return {
//           rule: rule?.name,
//           description: rule?.description,
//           parameters: Object.values(params),
//         };
//       }),
//     };

//     console.log("Field Configuration:", fieldConfig);
//     alert(JSON.stringify(fieldConfig, null, 2));
//   };

//   // Render the appropriate input component based on field type
//   const renderFieldInput = (fieldType: FieldType) => {
//     const fieldName = fieldType.name.toLowerCase();

//     switch (fieldType.id) {
//       case 1: // Text Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Text Input</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Enter text..." {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 2: // Email Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Email Input</FormLabel>
//                 <FormControl>
//                   <Input type="email" placeholder="Enter email..." {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 3: // Number Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Number Input</FormLabel>
//                 <FormControl>
//                   <Input
//                     type="number"
//                     placeholder="Enter number..."
//                     {...field}
//                     onChange={(e) => field.onChange(parseFloat(e.target.value))}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 4: // Phone Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Phone Input</FormLabel>
//                 <FormControl>
//                   <Input type="tel" placeholder="Enter phone number..." {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 5: // Text Area
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Text Area</FormLabel>
//                 <FormControl>
//                   <Textarea placeholder="Enter text..." rows={4} {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 6: // Date Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem className="flex flex-col">
//                 <FormLabel>Date Input</FormLabel>
//                 <Popover>
//                   <PopoverTrigger asChild>
//                     <FormControl>
//                       <Button
//                         variant="outline"
//                         className={cn(
//                           "w-full pl-3 text-left font-normal",
//                           !field.value && "text-muted-foreground"
//                         )}
//                       >
//                         {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//                         <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                       </Button>
//                     </FormControl>
//                   </PopoverTrigger>
//                   <PopoverContent className="w-auto p-0" align="start">
//                     <Calendar
//                       mode="single"
//                       selected={field.value}
//                       onSelect={field.onChange}
//                       initialFocus
//                     />
//                   </PopoverContent>
//                 </Popover>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 7: // Time Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Time Input</FormLabel>
//                 <FormControl>
//                   <Input type="time" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 8: // DateTime Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>DateTime Input</FormLabel>
//                 <FormControl>
//                   <Input type="datetime-local" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 9: // Checkbox
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                 <FormControl>
//                   <Checkbox
//                     checked={field.value}
//                     onCheckedChange={field.onChange}
//                   />
//                 </FormControl>
//                 <div className="space-y-1 leading-none">
//                   <FormLabel>Checkbox Option</FormLabel>
//                   <FormDescription>Check this box to enable</FormDescription>
//                 </div>
//               </FormItem>
//             )}
//           />
//         );

//       case 10: // Radio Button
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem className="space-y-3">
//                 <FormLabel>Radio Button</FormLabel>
//                 <FormControl>
//                   <RadioGroup
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                     className="flex flex-col space-y-1"
//                   >
//                     <FormItem className="flex items-center space-x-3 space-y-0">
//                       <FormControl>
//                         <RadioGroupItem value="option1" />
//                       </FormControl>
//                       <FormLabel className="font-normal">Option 1</FormLabel>
//                     </FormItem>
//                     <FormItem className="flex items-center space-x-3 space-y-0">
//                       <FormControl>
//                         <RadioGroupItem value="option2" />
//                       </FormControl>
//                       <FormLabel className="font-normal">Option 2</FormLabel>
//                     </FormItem>
//                     <FormItem className="flex items-center space-x-3 space-y-0">
//                       <FormControl>
//                         <RadioGroupItem value="option3" />
//                       </FormControl>
//                       <FormLabel className="font-normal">Option 3</FormLabel>
//                     </FormItem>
//                   </RadioGroup>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 11: // Dropdown Select
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Dropdown Select</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select an option" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value="option1">Option 1</SelectItem>
//                     <SelectItem value="option2">Option 2</SelectItem>
//                     <SelectItem value="option3">Option 3</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 17: // URL Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>URL Input</FormLabel>
//                 <FormControl>
//                   <Input type="url" placeholder="https://example.com" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 18: // Password Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Password Input</FormLabel>
//                 <FormControl>
//                   <Input type="password" placeholder="Enter password..." {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 19: // Color Picker
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Color Picker</FormLabel>
//                 <FormControl>
//                   <Input type="color" {...field} className="h-10" />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 21: // Slider
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Slider ({field.value || 0})</FormLabel>
//                 <FormControl>
//                   <Slider
//                     min={0}
//                     max={100}
//                     step={1}
//                     value={[field.value || 0]}
//                     onValueChange={(vals) => field.onChange(vals[0])}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 22: // Toggle Switch
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
//                 <div className="space-y-0.5">
//                   <FormLabel className="text-base">Toggle Switch</FormLabel>
//                   <FormDescription>Enable or disable this option</FormDescription>
//                 </div>
//                 <FormControl>
//                   <Switch
//                     checked={field.value}
//                     onCheckedChange={field.onChange}
//                   />
//                 </FormControl>
//               </FormItem>
//             )}
//           />
//         );

//       case 23: // Currency Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Currency Input</FormLabel>
//                 <FormControl>
//                   <div className="relative">
//                     <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
//                     <Input
//                       type="number"
//                       placeholder="0.00"
//                       className="pl-7"
//                       {...field}
//                       onChange={(e) => field.onChange(parseFloat(e.target.value))}
//                     />
//                   </div>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       case 24: // Percentage Input
//         return (
//           <FormField
//             control={form.control}
//             name="fieldValue"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Percentage Input</FormLabel>
//                 <FormControl>
//                   <div className="relative">
//                     <Input
//                       type="number"
//                       placeholder="0"
//                       className="pr-7"
//                       min={0}
//                       max={100}
//                       {...field}
//                       onChange={(e) => field.onChange(parseFloat(e.target.value))}
//                     />
//                     <span className="absolute right-3 top-2.5 text-muted-foreground">%</span>
//                   </div>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         );

//       default:
//         return (
//           <FormItem>
//             <FormLabel>{fieldType.name}</FormLabel>
//             <FormControl>
//               <Input placeholder={`Enter ${fieldType.name.toLowerCase()}...`} />
//             </FormControl>
//             <FormDescription>
//               This field type doesn't have a specific implementation yet.
//             </FormDescription>
//           </FormItem>
//         );
//     }
//   };

//   if (fieldTypesLoading || inputRulesLoading) {
//     return <div className="text-sm text-muted-foreground">Loading...</div>;
//   }

//   if (fieldTypesError || inputRulesError) {
//     return (
//       <div className="text-sm text-destructive">
//         Error: {fieldTypesError || inputRulesError}
//       </div>
//     );
//   }

//   return (
//     <div className="w-full space-y-6">
//       {/* Field Type Selection */}
//       <div className="space-y-2">
//         <label className="text-sm font-medium">Select Field Type</label>
//         <Popover open={open} onOpenChange={setOpen}>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               role="combobox"
//               aria-expanded={open}
//               className="w-full justify-between"
//             >
//               {selectedFieldType ? selectedFieldType.name : "Select field type..."}
//               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-full p-0" align="start">
//             <Command>
//               <CommandInput placeholder="Search field types..." />
//               <CommandList>
//                 <CommandEmpty>No field type found.</CommandEmpty>
//                 <CommandGroup>
//                   <ScrollArea className="h-[300px]">
//                     {fieldTypes.map((fieldType) => (
//                       <CommandItem
//                         key={fieldType.id}
//                         value={fieldType.name}
//                         onSelect={() => {
//                           setSelectedFieldTypeId(fieldType.id);
//                           setSelectedRules(new Set());
//                           setRuleParameters({});
//                           form.reset();
//                           setOpen(false);
//                         }}
//                       >
//                         <Check
//                           className={cn(
//                             "mr-2 h-4 w-4",
//                             selectedFieldTypeId === fieldType.id ? "opacity-100" : "opacity-0"
//                           )}
//                         />
//                         {fieldType.name}
//                       </CommandItem>
//                     ))}
//                   </ScrollArea>
//                 </CommandGroup>
//               </CommandList>
//             </Command>
//           </PopoverContent>
//         </Popover>
//       </div>

//       {/* Dynamic Form */}
//       {selectedFieldType && (
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//             {/* Field Input */}
//             <div className="rounded-lg border p-4 space-y-4">
//               <h3 className="text-lg font-semibold">Field Configuration</h3>
//               {renderFieldInput(selectedFieldType)}
//             </div>

//             {/* Validation Rules */}
//             {applicableRules.length > 0 && (
//               <div className="rounded-lg border p-4 space-y-4">
//                 <div className="flex items-center gap-2">
//                   <Info className="h-4 w-4 text-muted-foreground" />
//                   <h3 className="text-lg font-semibold">
//                     Validation Rules ({applicableRules.length} available)
//                   </h3>
//                 </div>

//                 <ScrollArea className="h-[400px] w-full pr-4">
//                   <div className="space-y-3">
//                     {applicableRules.map((rule) => {
//                       const isSelected = selectedRules.has(rule.id);
//                       const params = RULE_PARAMETERS[rule.name];

//                       return (
//                         <div
//                           key={rule.id}
//                           className={cn(
//                             "rounded-md border p-4 space-y-3 transition-colors",
//                             isSelected && "border-primary bg-accent/50"
//                           )}
//                         >
//                           {/* Rule Header */}
//                           <div className="flex items-start justify-between gap-4">
//                             <div className="flex items-start gap-3 flex-1">
//                               <Checkbox
//                                 id={`rule-${rule.id}`}
//                                 checked={isSelected}
//                                 onCheckedChange={(checked) =>
//                                   handleRuleToggle(rule.id, checked as boolean)
//                                 }
//                               />
//                               <div className="space-y-1 flex-1">
//                                 <label
//                                   htmlFor={`rule-${rule.id}`}
//                                   className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
//                                 >
//                                   {rule.name}
//                                   {!rule.is_public && (
//                                     <Badge variant="outline" className="ml-2 text-xs">
//                                       Private
//                                     </Badge>
//                                   )}
//                                 </label>
//                                 <p className="text-sm text-muted-foreground">
//                                   {rule.description}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Rule Parameters */}
//                           {isSelected && params && (
//                             <div className="ml-7 space-y-3 pt-2 border-t">
//                               <p className="text-xs font-medium text-muted-foreground">
//                                 Configuration:
//                               </p>
//                               {params.map((param, index) => (
//                                 <div key={index} className="space-y-1.5">
//                                   <label className="text-xs font-medium">
//                                     {param.label}
//                                     {param.required && (
//                                       <span className="text-destructive ml-1">*</span>
//                                     )}
//                                   </label>
//                                   {param.type === "number" ? (
//                                     <Input
//                                       type="number"
//                                       placeholder="Enter value"
//                                       className="h-8"
//                                       onChange={(e) =>
//                                         handleParameterChange(
//                                           rule.id,
//                                           index,
//                                           parseFloat(e.target.value)
//                                         )
//                                       }
//                                     />
//                                   ) : param.type === "date" ? (
//                                     <Input
//                                       type="date"
//                                       className="h-8"
//                                       onChange={(e) =>
//                                         handleParameterChange(rule.id, index, e.target.value)
//                                       }
//                                     />
//                                   ) : (
//                                     <Input
//                                       type="text"
//                                       placeholder="Enter value"
//                                       className="h-8"
//                                       onChange={(e) =>
//                                         handleParameterChange(rule.id, index, e.target.value)
//                                       }
//                                     />
//                                   )}
//                                 </div>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </ScrollArea>
//               </div>
//             )}

//             {/* Submit Button */}
//             <Button type="submit" className="w-full">
//               Generate Field Configuration
//             </Button>
//           </form>
//         </Form>
//       )}
//     </div>
//   );
// }
