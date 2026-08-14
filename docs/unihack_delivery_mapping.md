# UniHack Delivery Format — Field-by-Field Mapping

This document records the exact behavior of the dedicated 252-column UniHack delivery export. The header list is copied in the supplied order and must not be changed. `Mapped` fields are populated only from validated evidence. `Conditional` fields are populated only when their stated condition is met. `Intentionally blank` fields remain empty until an approved source, master list, or controlled mapping is supplied.

| # | Required header | Export status | Source or policy |
|---:|---|---|---|
| 1 | `MFR URL` | **Mapped** | First unique manufacturer-owned evidence URL from validated attributes. |
| 2 | `Ref URL 1` | **Conditional** | Populated only with additional unique manufacturer-owned evidence URLs; otherwise blank. |
| 3 | `Ref URL 2` | **Conditional** | Populated only with additional unique manufacturer-owned evidence URLs; otherwise blank. |
| 4 | `Ref URL 3` | **Conditional** | Populated only with additional unique manufacturer-owned evidence URLs; otherwise blank. |
| 5 | `Ref URL 4` | **Conditional** | Populated only with additional unique manufacturer-owned evidence URLs; otherwise blank. |
| 6 | `Ref URL 5` | **Conditional** | Populated only with additional unique manufacturer-owned evidence URLs; otherwise blank. |
| 7 | `PART_NUMBER` | **Mapped** | Resolved manufacturer part number (`mfgPartNum`). |
| 8 | `Dept` | **Mapped** | First segment of validated `Classpath`. |
| 9 | `Class` | **Mapped** | Second segment of validated `Classpath`. |
| 10 | `Fine` | **Mapped** | Third segment of validated `Classpath`. |
| 11 | `SKU - MY_PART_NUMBER` | **Mapped** | Uses manufacturer part number because no distributor SKU is supplied. |
| 12 | `Mfg_Part_Num` | **Mapped** | Retained cleaned source MPN. |
| 13 | `Part_Desc` | **Mapped** | Retained cleaned source description. |
| 14 | `E1_Brand` | **Mapped** | Retained source brand; configured placeholders are blank. |
| 15 | `Unilog_Brand` | **Mapped** | Retained source brand; configured placeholders are blank. |
| 16 | `DIB_Brand` | **Mapped** | Retained source brand; configured placeholders are blank. |
| 17 | `Part_Manuf` | **Mapped** | Retained source supplier manufacturer. |
| 18 | `MANUFACTURER_NAME` | **Mapped** | Canonical resolved manufacturer when evidence threshold passes. |
| 19 | `BRAND_NAME` | **Mapped** | Canonical resolved brand when evidence threshold passes. |
| 20 | `TRADE_NAME` | **Mapped** | Validated `productLine` attribute. |
| 21 | `MANUFACTURER_PART_NUMBER` | **Mapped** | Resolved manufacturer part number (`mfgPartNum`). |
| 22 | `ALTERNATE_PART_NUMBER` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 23 | `Classpath` | **Mapped** | Validated deterministic abrasives category path. |
| 24 | `MOBILE_DESC` | **Mapped** | Deterministic validated mobile description. |
| 25 | `INVOICE_DESC` | **Mapped** | Deterministic validated invoice description. |
| 26 | `SHORT_DESC` | **Mapped** | Deterministic validated short description. |
| 27 | `LONG_DESC1` | **Mapped** | Deterministic validated long description. |
| 28 | `RETAIL_DESC` | **Mapped** | Uses deterministic short description. |
| 29 | `MARKETING_DESCRIPTION` | **Mapped** | Uses deterministic long description. |
| 30 | `ITEM_FEATURES_1` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 31 | `ITEM_FEATURES_2` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 32 | `ITEM_FEATURES_3` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 33 | `ITEM_FEATURES_4` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 34 | `ITEM_FEATURES_5` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 35 | `ITEM_FEATURES_6` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 36 | `ITEM_FEATURES_7` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 37 | `ITEM_FEATURES_8` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 38 | `ITEM_FEATURES_9` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 39 | `ITEM_FEATURES_10` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 40 | `ITEM_FEATURES_11` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 41 | `ITEM_FEATURES_12` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 42 | `ITEM_FEATURES_13` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 43 | `ITEM_FEATURES_14` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 44 | `ITEM_FEATURES_15` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 45 | `ITEM_FEATURES_16` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 46 | `ITEM_FEATURES_17` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 47 | `ITEM_FEATURES_18` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 48 | `ITEM_FEATURES_19` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 49 | `ITEM_FEATURES_20` | **Conditional** | Ranked validated attribute rendered as `Label: Value`; blank when no ranked attribute exists. |
| 50 | `With` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 51 | `Standard/Approvals` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 52 | `Prop 65` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 53 | `Application` | **Mapped** | Validated `intendedUse` attribute. |
| 54 | `Includes` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 55 | `Product Name` | **Mapped** | Deterministic validated product title. |
| 56 | `ATTRIBUTE_LABEL 1` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 57 | `ATTRIBUTE_VALUE 1` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 58 | `ATTRIBUTE_UOM 1` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 59 | `ATTRIBUTE_LABEL 2` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 60 | `ATTRIBUTE_VALUE 2` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 61 | `ATTRIBUTE_UOM 2` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 62 | `ATTRIBUTE_LABEL 3` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 63 | `ATTRIBUTE_VALUE 3` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 64 | `ATTRIBUTE_UOM 3` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 65 | `ATTRIBUTE_LABEL 4` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 66 | `ATTRIBUTE_VALUE 4` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 67 | `ATTRIBUTE_UOM 4` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 68 | `ATTRIBUTE_LABEL 5` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 69 | `ATTRIBUTE_VALUE 5` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 70 | `ATTRIBUTE_UOM 5` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 71 | `ATTRIBUTE_LABEL 6` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 72 | `ATTRIBUTE_VALUE 6` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 73 | `ATTRIBUTE_UOM 6` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 74 | `ATTRIBUTE_LABEL 7` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 75 | `ATTRIBUTE_VALUE 7` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 76 | `ATTRIBUTE_UOM 7` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 77 | `ATTRIBUTE_LABEL 8` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 78 | `ATTRIBUTE_VALUE 8` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 79 | `ATTRIBUTE_UOM 8` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 80 | `ATTRIBUTE_LABEL 9` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 81 | `ATTRIBUTE_VALUE 9` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 82 | `ATTRIBUTE_UOM 9` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 83 | `ATTRIBUTE_LABEL 10` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 84 | `ATTRIBUTE_VALUE 10` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 85 | `ATTRIBUTE_UOM 10` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 86 | `ATTRIBUTE_LABEL 11` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 87 | `ATTRIBUTE_VALUE 11` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 88 | `ATTRIBUTE_UOM 11` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 89 | `ATTRIBUTE_LABEL 12` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 90 | `ATTRIBUTE_VALUE 12` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 91 | `ATTRIBUTE_UOM 12` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 92 | `ATTRIBUTE_LABEL 13` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 93 | `ATTRIBUTE_VALUE 13` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 94 | `ATTRIBUTE_UOM 13` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 95 | `ATTRIBUTE_LABEL 14` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 96 | `ATTRIBUTE_VALUE 14` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 97 | `ATTRIBUTE_UOM 14` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 98 | `ATTRIBUTE_LABEL 15` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 99 | `ATTRIBUTE_VALUE 15` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 100 | `ATTRIBUTE_UOM 15` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 101 | `ATTRIBUTE_LABEL 16` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 102 | `ATTRIBUTE_VALUE 16` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 103 | `ATTRIBUTE_UOM 16` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 104 | `ATTRIBUTE_LABEL 17` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 105 | `ATTRIBUTE_VALUE 17` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 106 | `ATTRIBUTE_UOM 17` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 107 | `ATTRIBUTE_LABEL 18` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 108 | `ATTRIBUTE_VALUE 18` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 109 | `ATTRIBUTE_UOM 18` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 110 | `ATTRIBUTE_LABEL 19` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 111 | `ATTRIBUTE_VALUE 19` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 112 | `ATTRIBUTE_UOM 19` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 113 | `ATTRIBUTE_LABEL 20` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 114 | `ATTRIBUTE_VALUE 20` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 115 | `ATTRIBUTE_UOM 20` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 116 | `ATTRIBUTE_LABEL 21` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 117 | `ATTRIBUTE_VALUE 21` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 118 | `ATTRIBUTE_UOM 21` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 119 | `ATTRIBUTE_LABEL 22` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 120 | `ATTRIBUTE_VALUE 22` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 121 | `ATTRIBUTE_UOM 22` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 122 | `ATTRIBUTE_LABEL 23` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 123 | `ATTRIBUTE_VALUE 23` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 124 | `ATTRIBUTE_UOM 23` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 125 | `ATTRIBUTE_LABEL 24` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 126 | `ATTRIBUTE_VALUE 24` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 127 | `ATTRIBUTE_UOM 24` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 128 | `ATTRIBUTE_LABEL 25` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 129 | `ATTRIBUTE_VALUE 25` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 130 | `ATTRIBUTE_UOM 25` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 131 | `ATTRIBUTE_LABEL 26` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 132 | `ATTRIBUTE_VALUE 26` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 133 | `ATTRIBUTE_UOM 26` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 134 | `ATTRIBUTE_LABEL 27` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 135 | `ATTRIBUTE_VALUE 27` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 136 | `ATTRIBUTE_UOM 27` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 137 | `ATTRIBUTE_LABEL 28` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 138 | `ATTRIBUTE_VALUE 28` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 139 | `ATTRIBUTE_UOM 28` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 140 | `ATTRIBUTE_LABEL 29` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 141 | `ATTRIBUTE_VALUE 29` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 142 | `ATTRIBUTE_UOM 29` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 143 | `ATTRIBUTE_LABEL 30` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 144 | `ATTRIBUTE_VALUE 30` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 145 | `ATTRIBUTE_UOM 30` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 146 | `ATTRIBUTE_LABEL 31` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 147 | `ATTRIBUTE_VALUE 31` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 148 | `ATTRIBUTE_UOM 31` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 149 | `ATTRIBUTE_LABEL 32` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 150 | `ATTRIBUTE_VALUE 32` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 151 | `ATTRIBUTE_UOM 32` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 152 | `ATTRIBUTE_LABEL 33` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 153 | `ATTRIBUTE_VALUE 33` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 154 | `ATTRIBUTE_UOM 33` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 155 | `ATTRIBUTE_LABEL 34` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 156 | `ATTRIBUTE_VALUE 34` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 157 | `ATTRIBUTE_UOM 34` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 158 | `ATTRIBUTE_LABEL 35` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 159 | `ATTRIBUTE_VALUE 35` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 160 | `ATTRIBUTE_UOM 35` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 161 | `ATTRIBUTE_LABEL 36` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 162 | `ATTRIBUTE_VALUE 36` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 163 | `ATTRIBUTE_UOM 36` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 164 | `ATTRIBUTE_LABEL 37` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 165 | `ATTRIBUTE_VALUE 37` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 166 | `ATTRIBUTE_UOM 37` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 167 | `ATTRIBUTE_LABEL 38` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 168 | `ATTRIBUTE_VALUE 38` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 169 | `ATTRIBUTE_UOM 38` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 170 | `ATTRIBUTE_LABEL 39` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 171 | `ATTRIBUTE_VALUE 39` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 172 | `ATTRIBUTE_UOM 39` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 173 | `ATTRIBUTE_LABEL 40` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 174 | `ATTRIBUTE_VALUE 40` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 175 | `ATTRIBUTE_UOM 40` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 176 | `ATTRIBUTE_LABEL 41` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 177 | `ATTRIBUTE_VALUE 41` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 178 | `ATTRIBUTE_UOM 41` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 179 | `ATTRIBUTE_LABEL 42` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 180 | `ATTRIBUTE_VALUE 42` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 181 | `ATTRIBUTE_UOM 42` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 182 | `ATTRIBUTE_LABEL 43` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 183 | `ATTRIBUTE_VALUE 43` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 184 | `ATTRIBUTE_UOM 43` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 185 | `ATTRIBUTE_LABEL 44` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 186 | `ATTRIBUTE_VALUE 44` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 187 | `ATTRIBUTE_UOM 44` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 188 | `ATTRIBUTE_LABEL 45` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 189 | `ATTRIBUTE_VALUE 45` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 190 | `ATTRIBUTE_UOM 45` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 191 | `ATTRIBUTE_LABEL 46` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 192 | `ATTRIBUTE_VALUE 46` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 193 | `ATTRIBUTE_UOM 46` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 194 | `ATTRIBUTE_LABEL 47` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 195 | `ATTRIBUTE_VALUE 47` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 196 | `ATTRIBUTE_UOM 47` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 197 | `ATTRIBUTE_LABEL 48` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 198 | `ATTRIBUTE_VALUE 48` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 199 | `ATTRIBUTE_UOM 48` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 200 | `ATTRIBUTE_LABEL 49` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 201 | `ATTRIBUTE_VALUE 49` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 202 | `ATTRIBUTE_UOM 49` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 203 | `ATTRIBUTE_LABEL 50` | **Conditional** | Ranked validated attribute label; blank after the available validated-attribute count. |
| 204 | `ATTRIBUTE_VALUE 50` | **Conditional** | Ranked validated attribute normalized value; blank after the available validated-attribute count. |
| 205 | `ATTRIBUTE_UOM 50` | **Conditional** | Ranked validated attribute UOM; blank when unitless or unavailable. |
| 206 | `UPC` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 207 | `EAN` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 208 | `GTIN` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 209 | `UNSPSC` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 210 | `Warranty` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 211 | `List Price` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 212 | `Selling Qty` | **Mapped** | Numeric portion of validated `packQuantity`. |
| 213 | `Selling UOM` | **Mapped** | UOM portion of validated `packQuantity`. |
| 214 | `Standard Packaging Information` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 215 | `LENGTH` | **Mapped** | Second parsed value of a two/three-part dimensions attribute. |
| 216 | `LENGTH_UOM` | **Mapped** | UOM of the mapped length dimension. |
| 217 | `HEIGHT` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 218 | `HEIGHT_UOM` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 219 | `WIDTH` | **Mapped** | First parsed value of a two/three-part dimensions attribute. |
| 220 | `WIDTH_UOM` | **Mapped** | UOM of the mapped width dimension. |
| 221 | `WEIGHT` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 222 | `WEIGHT_UOM` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 223 | `VOLUME` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 224 | `VOLUME_UOM` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 225 | `Product Image` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 226 | `Alternate Image 1` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 227 | `Alternate Image 2` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 228 | `Alternate Image 3` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 229 | `Alternate Image 4` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 230 | `SDS` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 231 | `SDS_1` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 232 | `Warranty Information` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 233 | `Catalog` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 234 | `Specification Sheet` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 235 | `Instruction/Installation Manual` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 236 | `Service Manual` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 237 | `Owners/User Manual` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 238 | `Line Drawing` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 239 | `MTR` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 240 | `RoHS` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 241 | `Full Engineering Drawing` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 242 | `Energy Star Guide` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 243 | `Technical Bulletin` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 244 | `Submittal` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 245 | `Compatibility Chart` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 246 | `Size Chart` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 247 | `Product Label/Insert` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 248 | `Video Link` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 249 | `Video Link 1` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 250 | `Country Of Origin` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 251 | `Discontinued` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |
| 252 | `Actual Image (Yes/No)` | **Intentionally blank** | No approved source evidence or controlled mapping is presently available; TraceForge does not infer this field. |

## Submission safety rule

The export always writes all 252 columns in the exact supplied order. An empty field is a deliberate statement of unavailable evidence, not a missing column and not a guessed value. The dedicated test suite fingerprints the source template header sequence and verifies every generated row has 252 fields.
